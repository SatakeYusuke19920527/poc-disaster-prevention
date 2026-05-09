# Docs

防災マルチエージェントチャット PoC のドキュメント一覧。

## 読む順序（推奨）

1. [requirements.md](./requirements.md) — 要件定義書
2. [basic-design.md](./basic-design.md) — 基本設計書（システム全体構成・Azure リソース）
3. [detailed-design.md](./detailed-design.md) — 詳細設計書（API・型・関数・例外）

## ドキュメント一覧

### 設計

| ファイル | 概要 |
| --- | --- |
| [requirements.md](./requirements.md) | 要件定義書（背景・スコープ・機能/非機能要件） |
| [basic-design.md](./basic-design.md) | 基本設計書（構成図・モジュール分割・データ設計の概要） |
| [detailed-design.md](./detailed-design.md) | 詳細設計書（API/型/オーケストレータ疑似コード/Activity 別ロジック） |
| [data-design.md](./data-design.md) | データ設計書（Cosmos / AI Search Index / Blob のスキーマ詳細） |
| [security-design.md](./security-design.md) | セキュリティ設計書（認証・RBAC・シークレット・脅威対応） |
| [prompt-design.md](./prompt-design.md) | プロンプト設計書（4 プロンプトの方針・更新手順） |

### 仕様

| ファイル | 概要 |
| --- | --- |
| [api-spec.md](./api-spec.md) | REST API 仕様（OpenAPI の要約と利用方法） |
| [api/openapi.yaml](./api/openapi.yaml) | OpenAPI 3.0 定義 |

### 開発・運用

| ファイル | 概要 |
| --- | --- |
| [development-setup.md](./development-setup.md) | ローカル開発環境構築手順 |
| [deployment.md](./deployment.md) | Azure へのデプロイ手順 |
| [test-plan.md](./test-plan.md) | テスト方針・観点・PoC 受入確認 |
| [operations-runbook.md](./operations-runbook.md) | 運用 Runbook（監視・障害一次対応） |

### 補助

| ファイル | 概要 |
| --- | --- |
| [glossary.md](./glossary.md) | 用語集 |

## 図表

- フロー図・シーケンス図は **Mermaid** で記述（GitHub 上で描画）
- インフラ構成図は **Azure 公式アイコン**を使用（[basic-design.md §6.0.1](./basic-design.md)、[infra/README.md](../infra/README.md)）

## 編集ガイドライン

- シークレット・接続文字列・本番固有の URL を含めない
- 実装と乖離した記述を見つけた場合は、対応する設計文書を先に修正してから実装を直す
- 重複するより相互リンクで補完する
