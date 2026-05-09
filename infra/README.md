# Infrastructure (Terraform)

防災マルチエージェントチャット PoC の Azure リソース定義。

## アーキテクチャ図

<div align="center">

<table>
  <tr>
    <td align="center" width="180">
      👤<br/><b>User<br/>(Browser)</b>
    </td>
    <td align="center">⟶</td>
    <td align="center" width="180">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/web/Static-Apps.svg" width="56" alt="Static Web Apps"/><br/>
      <b>Static Web Apps</b><br/>
      <sub>Next.js (Free)</sub>
    </td>
    <td align="center">⟶</td>
    <td align="center" width="180">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/compute/Function-Apps.svg" width="56" alt="Function App"/><br/>
      <b>Function App</b><br/>
      <sub>Flex Consumption<br/>Node 20 / Durable</sub>
    </td>
  </tr>
</table>

<br/>

<table>
  <tr>
    <th colspan="4">⬇️ Function App ↔ 各サービス（Managed Identity + RBAC）</th>
  </tr>
  <tr>
    <td align="center" width="180">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/ai_machine_learning/Cognitive-Services.svg" width="56" alt="Azure OpenAI"/><br/>
      <b>Azure OpenAI</b><br/>
      <sub>gpt-4o-mini × 4</sub>
    </td>
    <td align="center" width="180">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/ai_machine_learning/Cognitive-Search.svg" width="56" alt="Azure AI Search"/><br/>
      <b>Azure AI Search</b><br/>
      <sub>basic / RAG</sub>
    </td>
    <td align="center" width="180">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/databases/Azure-Cosmos-DB.svg" width="56" alt="Cosmos DB"/><br/>
      <b>Cosmos DB</b><br/>
      <sub>Serverless<br/>PK: /userId</sub>
    </td>
    <td align="center" width="180">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/storage/Storage-Accounts.svg" width="56" alt="Storage Account"/><br/>
      <b>Storage Account</b><br/>
      <sub>deploymentpackage<br/>assets</sub>
    </td>
  </tr>
</table>

<br/>

<table>
  <tr>
    <th colspan="2">⬇️ 計測・ログ</th>
  </tr>
  <tr>
    <td align="center" width="220">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/monitor/Application-Insights.svg" width="56" alt="Application Insights"/><br/>
      <b>Application Insights</b>
    </td>
    <td align="center" width="220">
      <img src="https://raw.githubusercontent.com/tf2d2/icons/main/azure/monitor/Log-Analytics-Workspaces.svg" width="56" alt="Log Analytics"/><br/>
      <b>Log Analytics Workspace</b>
    </td>
  </tr>
</table>

</div>

## 構成リソース

| カテゴリ | リソース | 補足 |
|---|---|---|
| 基盤 | Resource Group, Log Analytics, Application Insights | |
| ストレージ | Storage Account + コンテナ (`deploymentpackage`, `assets`) | Functions ランタイム + Blob 資産 |
| AI | Azure OpenAI (Cognitive Services) + 4 deployments | `intent`, `furusato`, `disaster-simulation`, `disaster-learning` |
| 検索 | Azure AI Search (`basic` SKU, Managed Identity) | RAG 用 |
| DB | Cosmos DB (Serverless, SQL API) + Database + Container | partition key: `/userId` |
| API | Azure Functions Flex Consumption (Linux Node 20) | |
| Web | Static Web Apps (Free) | Next.js フロントエンド |

## 認証方針

- **Local Auth (キー / 接続文字列) は無効化**
  - OpenAI: `local_auth_enabled = false`
  - AI Search: `local_authentication_enabled = false`
  - Cosmos DB: `local_authentication_disabled = true`
- Function App の **System-Assigned Managed Identity** を各サービスに RBAC で付与
- AzureWebJobsStorage も Identity ベース (`AzureWebJobsStorage__accountName`)

## ロール割当

| 対象 | スコープ | ロール |
|---|---|---|
| Function MI | Storage Account | Storage Blob Data Owner / Storage Queue Data Contributor |
| Function MI | OpenAI | Cognitive Services OpenAI User |
| Function MI | AI Search | Search Index Data Reader / Search Service Contributor |
| Function MI | Cosmos DB | Cosmos DB Built-in Data Contributor |
| Dev (現 az login ユーザー) | OpenAI / Storage / Cosmos | 開発時アクセス用 (運用時は別管理推奨) |

## ファイル構成

```
infra/
├── versions.tf       # provider 定義
├── variables.tf      # 入力変数
├── main.tf           # RG, naming locals, random suffix
├── monitoring.tf     # Log Analytics + App Insights
├── storage.tf        # Storage Account + Containers
├── openai.tf         # OpenAI account + 4 deployments
├── search.tf         # Azure AI Search
├── cosmos.tf         # Cosmos DB account/db/container
├── function.tf       # Service Plan (FC1) + Function App
├── frontend.tf       # Static Web App
├── rbac.tf           # 全 Role Assignment
├── outputs.tf        # 出力 (api_base_url 等)
└── terraform.tfvars.example
```

## 使い方

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
az login
terraform init
terraform plan
terraform apply
```

## 出力

```bash
terraform output api_base_url        # frontend の NEXT_PUBLIC_API_BASE_URL
terraform output function_app_name   # Functions デプロイ先
terraform output -raw static_web_app_api_key  # SWA デプロイトークン
```

## apply 後の手動セットアップ

### CORS

`site_config.cors` は azurerm provider の既知バグ (動的値で不整合) を避けるため Terraform 管理外。apply 後に CLI で設定:

```bash
FUNC=$(terraform output -raw function_app_name)
RG=$(terraform output -raw resource_group_name)
SWA_HOST=$(terraform output -raw static_web_app_default_host_name)

az functionapp cors add -g $RG -n $FUNC --allowed-origins "https://$SWA_HOST"
az functionapp cors add -g $RG -n $FUNC --allowed-origins "http://localhost:3000"
```

## 注意事項

- **OpenAI モデル可用性**: `gpt-4o-mini` の利用可能リージョンを `openai_location` で確認
- **Static Web App リージョン**: `eastasia` (近接の利用可能リージョン)
- **Cosmos Serverless**: PoC 向け課金。本番は Provisioned Throughput を検討
- **State**: ローカル state を使用。チーム運用ではリモート backend (Azure Storage 等) に切替
