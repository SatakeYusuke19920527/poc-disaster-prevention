# Functions (Azure Functions + Durable Functions)

防災マルチエージェントチャットの PoC バックエンド。Azure Functions Node.js v4 プログラミングモデル + TypeScript + Durable Functions。

## ディレクトリ

```
src/
├── functions/      # HTTP / Orchestrator / Activity 関数
├── services/       # Azure サービスクライアント (OpenAI / Search / Cosmos / Blob / App Insights)
├── prompts/        # 各エージェントのシステムプロンプト
├── shared/         # 環境変数, バリデーション, エラー
├── types/          # 共通型
└── index.ts        # 全関数の登録エントリポイント
```

## 関数一覧

| 種類 | 名前 | 役割 |
|---|---|---|
| HTTP | `chatHttpStart` | `POST /api/chat/start` でオーケストレーション開始 |
| HTTP | `getChatStatus` | `GET /api/chat/status/{instanceId}` |
| Orchestrator | `chatOrchestrator` | 決定論的に活動を順序実行 |
| Activity | `loadConversation` | Cosmos から会話履歴ロード |
| Activity | `classifyIntent` | Azure OpenAI で意図分類 |
| Activity | `retrieveContext` | Azure AI Search で RAG 検索 |
| Activity | `runFurusatoAgent` | ふるさとエージェント |
| Activity | `runDisasterSimulationAgent` | 防災シミュレーション |
| Activity | `runDisasterLearningAgent` | 防災学習 |
| Activity | `aggregateAnswer` | マルチエージェント結果集約 |
| Activity | `applyGuardrails` | 公式情報参照などの安全注意付与 |
| Activity | `saveConversation` | Cosmos に会話保存 |
| Activity | `trackTelemetry` | App Insights に計測送信 |

## リクエストフロー

```
chatHttpStart → chatOrchestrator
                  ├─ loadConversation (Cosmos)
                  ├─ classifyIntent (OpenAI)
                  ├─ retrieveContext (AI Search) ※必要時
                  ├─ run<Selected>Agent (OpenAI)
                  ├─ applyGuardrails
                  ├─ saveConversation (Cosmos)
                  └─ trackTelemetry (App Insights)
```

オーケストレータは決定論的：HTTP / random / 現在時刻直接利用 / 外部サービス直呼びを行いません。時刻は `context.df.currentUtcDateTime` を使用。

## セットアップ

### 必要環境
- Node.js 20+
- Azure Functions Core Tools v4 (`brew install azure/functions/azure-functions-core-tools@4`)
- Azurite (ローカルストレージエミュレータ) または実 Storage アカウント

### 設定
```bash
cp local.settings.json.example local.settings.json
# Azure OpenAI / AI Search / Cosmos / Blob / App Insights の値を設定
```

API キー未設定の場合、OpenAI / Cosmos などは `DefaultAzureCredential` (Managed Identity / az login) でフォールバック認証します。

### スクリプト
```bash
npm install
npm run build       # tsc
npm run watch       # tsc -w
npm run start       # build + func start
```

## リトライ方針

| サービス | 初期遅延 | リトライ回数 |
|---|---|---|
| Azure OpenAI | 2s | 3 |
| Azure AI Search | 1s | 2 |
| Cosmos DB (read/upsert) | 1s | 3 |

`upsert` は冪等。`saveConversation` は同一 `(sessionId, userId)` への upsert なのでリトライ可能。

## 設計上の制約

- Orchestrator から直接 Azure サービスを呼び出さない
- シークレットはコードに含めず環境変数経由
- ユーザー入力やシークレットを直接ログ出力しない
- Citations は AI Search 由来のもの以外は捏造しない
- 災害関連回答には公式情報参照の注意を自動付与
