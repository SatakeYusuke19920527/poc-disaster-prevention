# 運用 Runbook

防災マルチエージェントチャット PoC の運用・障害対応手順。

## 1. 監視

### 1.1 主要メトリクス（Application Insights）

| 種別 | 名称 | 推奨閾値（PoC） |
| --- | --- | --- |
| Custom Event | `ChatCompleted` | 1 件以上/分（無いと UI 未稼働の疑い） |
| Custom Metric | `latencyMs`（p95） | 15 秒以下 |
| Custom Metric | `TokenUsageInput` / `TokenUsageOutput` | 単発で 5,000 以下 |
| Exception | OpenAI/Search/Cosmos 例外 | 失敗率 5% 以下 |

### 1.2 KQL クエリ例

```kusto
// 直近 1 時間の平均レイテンシ・件数
customEvents
| where name == "ChatCompleted"
| where timestamp > ago(1h)
| summarize count(), avg(todouble(customMeasurements.latencyMs)) by bin(timestamp, 5m)
```

```kusto
// エージェント別件数
customEvents
| where name == "ChatCompleted"
| where timestamp > ago(24h)
| summarize count() by tostring(customDimensions.agent)
```

```kusto
// 直近の失敗
exceptions
| where timestamp > ago(1h)
| project timestamp, type, outerMessage, operation_Name, cloud_RoleName
| order by timestamp desc
| take 50
```

```kusto
// トークン消費の大きいリクエスト
customEvents
| where name == "ChatCompleted"
| where timestamp > ago(24h)
| extend totalTokens = todouble(customMeasurements.tokenInput) + todouble(customMeasurements.tokenOutput)
| top 20 by totalTokens desc
```

## 2. 典型障害と一次対応

### 2.1 OpenAI 429 / 5xx

| 症状 | 対処 |
| --- | --- |
| `RateLimit` 多発 | デプロイメントの TPM (`openai_deployment_capacity`) 増加。Azure Portal で確認 |
| 5xx 連続 | リージョン障害の可能性。Azure Status を確認。一時的なら 3 リトライで吸収される |
| モデル未使用 | `AZURE_OPENAI_DEPLOYMENT_*` 設定値とインフラの deployment 名が一致しているか確認 |

### 2.2 Cosmos DB 競合 (412)

- `saveConversation` の upsert は ETag を見ない単純 upsert。並列同セッション書き込みで競合する場合は将来的に楽観ロック導入を検討
- 一次対応：再試行で吸収。継続するなら同 sessionId に対する並列リクエストを抑止

### 2.3 AI Search タイムアウト / 0 件

- `documents=[]` で継続するため致命的ではない
- インデックスへの再投入が必要なケースを切り分け（インデックス名 `disaster-index` を確認）

### 2.4 Functions 起動失敗 / コールドスタック

| 症状 | 対処 |
| --- | --- |
| `Storage` 関連エラー | `AzureWebJobsStorage__accountName` の設定値、Storage Account の MI ロール (`Storage Blob Data Owner`) を確認 |
| 起動が遅い | Flex Consumption の Always Ready Instance を 1 に設定（`infra/function.tf`） |
| 401 Unauthorized | Function App MI に対象サービスのロール付与状況を確認 |

### 2.5 ガードレール誤検知 / 誤通過

- `applyGuardrails` の災害キーワード辞書を見直し（[prompt-design.md](./prompt-design.md) 連動）
- 引用に外部 URL が混入する場合は `runXxxAgent` のプロンプトで「documents 以外の URL を出さない」旨を強化

## 3. アラート設計（推奨）

| アラート | 条件 | 通知 |
| --- | --- | --- |
| 失敗率上昇 | `exceptions` が 5 分間で 10 件超 | Teams / Email |
| レイテンシ悪化 | `latencyMs` p95 が 15 秒超を 10 分継続 | Teams |
| イベント途絶 | `ChatCompleted` が 30 分ゼロ（営業時間内） | Teams |

## 4. 定期作業

| 周期 | 作業 |
| --- | --- |
| 月次 | OpenAI 利用量・コストの確認 |
| 月次 | AI Search インデックスの最新化（資料追加・差し替え） |
| 四半期 | プロンプト効果の振り返り（[prompt-design.md](./prompt-design.md)） |
| 必要時 | Cosmos DB のサイズ・古い会話の TTL 設定検討 |

## 5. 緊急時の縮退

- 全エージェント停止：Function App を停止 → SWA 側でメンテ表示
- 1 エージェントのみ問題：`agentMode` UI から該当エージェントを一時非表示

## 6. 関連ドキュメント

- [security-design.md](./security-design.md)
- [test-plan.md](./test-plan.md)
- [detailed-design.md](./detailed-design.md) §9 例外処理
