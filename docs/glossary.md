# 用語集

本プロジェクトで使用する技術・ドメイン用語の定義。

## アーキテクチャ・処理

| 用語 | 説明 |
| --- | --- |
| エージェント (Agent) | 特定領域に特化した LLM プロンプト＋実行ロジックの単位。本 PoC では Furusato / Disaster Simulation / Disaster Learning の 3 種 |
| 意図分類 (Intent Classification) | ユーザー発話から最適エージェント・RAG 要否を判定する処理。`classifyIntent` Activity が担当 |
| RAG | Retrieval-Augmented Generation。AI Search で関連文書を取得し、生成プロンプトに付加する手法 |
| ガードレール (Guardrails) | 出力に安全注意・公式情報参照を付与し、捏造引用を除去する後処理。`applyGuardrails` Activity が担当 |
| オーケストレーション | 複数の Activity を決定論的順序で実行する Durable Functions の処理単位 |
| Activity (関数) | 外部サービス呼び出しなど副作用を伴う処理を行う Function。Orchestrator から `callActivity` で呼ぶ |

## Azure サービス

| 用語 | 説明 |
| --- | --- |
| Azure Functions | サーバーレスの関数実行基盤。本 PoC は Flex Consumption (Linux Node 20) |
| Durable Functions | Azure Functions 上のステートフルワークフロー拡張。長時間/多段処理を Orchestrator として記述 |
| Azure OpenAI Service | Azure 上で提供される OpenAI モデル。本 PoC は `gpt-4o-mini` を 4 deployments で利用 |
| Azure AI Search | 全文検索＋ベクトル検索の SaaS。RAG の検索バックエンドとして利用 |
| Azure Cosmos DB | グローバル分散型 NoSQL。本 PoC は SQL API / Serverless / Partition Key `/userId` |
| Azure Blob Storage | オブジェクトストレージ。Functions ランタイムパッケージと参考資料を格納 |
| Application Insights | アプリケーション監視・APM。レイテンシ・例外・カスタムイベント計測 |
| Log Analytics Workspace | Application Insights のバックエンド。KQL でログ・メトリクス検索 |
| Static Web Apps | Next.js / 静的サイトのホスティング。本 PoC は Free SKU |

## セキュリティ・認証

| 用語 | 説明 |
| --- | --- |
| Managed Identity (MI) | Azure リソースに付与する自動管理 ID。シークレットレスでサービスアクセス可能 |
| System-Assigned MI | リソース 1 対 1 で紐づく MI。リソース削除時に同時消失 |
| RBAC | Role-Based Access Control。Azure リソースへのアクセスをロールで制御 |
| Local Auth | キー / 接続文字列ベースのデータプレーン認証。本 PoC では無効化し MI + RBAC のみ許可 |
| DefaultAzureCredential | Azure SDK の認証チェーン。MI / `az login` / 環境変数等を順に試行 |

## ドメイン

| 用語 | 説明 |
| --- | --- |
| ふるさと | 利用者にゆかりのある地域。地域固有の防災・暮らし情報を提供する Furusato Agent の対象 |
| 防災シミュレーション | 災害シナリオに基づく被害想定・避難行動の対話的シミュレーション |
| 防災学習 | 平時の防災知識・FAQ・教育目的の対話 |
| Citation (引用) | 回答に付与する参考文書のメタデータ。AI Search 由来のものに限定（捏造禁止） |

## API・通信

| 用語 | 説明 |
| --- | --- |
| `instanceId` | Durable Functions のオーケストレーション識別子。`POST /api/chat/start` で発行 |
| `runtimeStatus` | オーケストレーションの実行状態。`Pending` / `Running` / `Completed` / `Failed` / `Terminated` |
| ポーリング | フロントエンドが `GET /api/chat/status/{instanceId}` を一定間隔で呼び出して結果取得する方式 |
