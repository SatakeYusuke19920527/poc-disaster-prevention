# 開発環境構築手順

ローカルマシンで本 PoC を開発・実行するための手順。

## 1. 前提

| ツール | バージョン | インストール例 (macOS) |
| --- | --- | --- |
| Node.js | 20.x | `brew install node@20` |
| Azure Functions Core Tools | v4 | `brew tap azure/functions && brew install azure-functions-core-tools@4` |
| Azurite (Storage エミュレータ) | 最新 | `npm install -g azurite` |
| Azure CLI | 最新 | `brew install azure-cli` |
| Terraform | 1.6+ | `brew install terraform` |
| Git | 任意 | `brew install git` |

Azure サブスクリプション・対象リソースグループへのアクセス権限が必要。

## 2. 初回セットアップ

### 2.1 リポジトリ取得・依存導入

```bash
git clone <repo-url>
cd poc-disaster-prevention

# Functions
cd functions && npm install && cd ..
# Frontend
cd frontend && npm install && cd ..
```

### 2.2 Azure ログイン

```bash
az login
az account set --subscription <subscription-id>
```

`DefaultAzureCredential` が `az login` の資格情報をフォールバック認証に利用するため必須。

## 3. 環境変数設定

### 3.1 Functions

```bash
cd functions
cp local.settings.json.example local.settings.json
```

`local.settings.json` の主な項目:

| キー | 用途 |
| --- | --- |
| `AzureWebJobsStorage` | Azurite 利用時は `UseDevelopmentStorage=true` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI のエンドポイント |
| `AZURE_OPENAI_DEPLOYMENT_*` | `INTENT` / `FURUSATO` / `DISASTER_SIMULATION` / `DISASTER_LEARNING` |
| `AZURE_SEARCH_ENDPOINT` / `AZURE_SEARCH_INDEX` | AI Search（既定 index: `disaster-index`） |
| `COSMOS_ENDPOINT` / `COSMOS_DATABASE` / `COSMOS_CONTAINER_CONVERSATIONS` | Cosmos DB |
| `BLOB_CONNECTION_STRING` / `BLOB_CONTAINER_ASSETS` | Blob |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights |

`AZURE_*_API_KEY` / `COSMOS_KEY` 等は **空のまま**で `DefaultAzureCredential` 経由で認証するのが推奨。

### 3.2 Frontend

```bash
cd frontend
cp .env.example .env.local   # 無ければ手動作成
```

`.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071
```

## 4. ローカル起動

別々のターミナルで起動する：

```bash
# Terminal 1: Azurite
azurite --silent --location ./.azurite --debug ./.azurite/debug.log

# Terminal 2: Functions
cd functions && npm run start

# Terminal 3: Frontend
cd frontend && npm run dev
```

ブラウザで `http://localhost:3000` を開く。

## 5. 動作確認

```bash
curl -X POST http://localhost:7071/api/chat/start \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"s1","userId":"u1","message":"地震の備えを教えて","agentMode":"auto"}'

# レスポンスの instanceId で
curl http://localhost:7071/api/chat/status/<instanceId>
```

## 6. トラブルシュート

| 症状 | 対処 |
| --- | --- |
| `func: command not found` | Azure Functions Core Tools v4 を再インストール |
| `Storage account is not configured` | Azurite が起動していない／`AzureWebJobsStorage` が未設定 |
| `401 Unauthorized` (OpenAI 等) | `az login` していない／対象リソースに RBAC 未付与 |
| `Cosmos DB 404` | 初回はドキュメント未作成。空履歴扱いで動作するのが正常 |
| ポート競合 | 7071 (Functions) / 3000 (Next.js) / 10000 系 (Azurite) を確認 |
| TypeScript エラー | `cd functions && npm run build` で再ビルド |

## 7. 関連ドキュメント

- [deployment.md](./deployment.md) — Azure へのデプロイ手順
- [test-plan.md](./test-plan.md) — テスト方針
- [operations-runbook.md](./operations-runbook.md) — 運用 Runbook
