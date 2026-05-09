# プロンプト設計書

各エージェント・分類器のプロンプト方針と更新手順。

実装：`functions/src/prompts/`

| ファイル | 用途 | 利用 deployment |
| --- | --- | --- |
| `intentClassifier.ts` | 意図分類 | `AZURE_OPENAI_DEPLOYMENT_INTENT` |
| `furusato.ts` | Furusato Agent | `AZURE_OPENAI_DEPLOYMENT_FURUSATO` |
| `disasterSimulation.ts` | Disaster Simulation Agent | `AZURE_OPENAI_DEPLOYMENT_DISASTER_SIMULATION` |
| `disasterLearning.ts` | Disaster Learning Agent | `AZURE_OPENAI_DEPLOYMENT_DISASTER_LEARNING` |

## 1. 共通方針

- 出力言語：日本語
- 出力形式：マークダウン（リスト・見出し可）
- 不確実な場合は推測せず「不明」と回答
- 引用は **AI Search で渡された `documents` の範囲のみ**。捏造禁止
- 災害関連は最新の公式情報（気象庁・自治体）の参照を促す
- 個人情報・差別的内容を生成しない

## 2. 意図分類（`intentClassifier`）

### 2.1 役割

ユーザー発話から **エージェント / RAG 要否 / 信頼度** を判定し JSON で返す。

### 2.2 入出力

入力：
- `message`: ユーザーの直近発話
- `history`: 会話履歴（要約・直近 N 件）

出力（厳密 JSON、追加プロパティ禁止）：

```json
{
  "intent": "短い意図ラベル",
  "agent": "furusato | disaster-simulation | disaster-learning",
  "needsRetrieval": true,
  "confidence": "low | medium | high"
}
```

### 2.3 失敗時挙動

JSON パース失敗 → デフォルト `{ intent: "general", agent: "disaster-learning", needsRetrieval: false, confidence: "low" }` を返す（実装側でフォールバック）。

### 2.4 設計上の注意

- 出力スキーマのキー / 値の集合を変えない（Activity 側のパースが破綻するため）
- システムプロンプト末尾で「JSON 以外を出力しない」を明示

## 3. Furusato Agent

### 3.1 役割

ユーザーゆかりの地域に関する **行政情報・観光・特産・防災** を回答。移住検討者視点も加味。

### 3.2 入力

- `message`, `history`, `documents`, `intent`

### 3.3 出力指針

- 地域固有性を意識（ハザードマップ・避難所・条例など）
- 公式 URL は `documents.url` に存在する場合のみ提示
- 不明な地域 / 情報は「自治体の公式サイトをご確認ください」と案内

## 4. Disaster Simulation Agent

### 4.1 役割

災害シナリオ（地震 / 水害 / 土砂災害 / 火山 等）に基づく **被害想定・避難行動・備蓄** をシミュレーション形式で提示。

### 4.2 出力指針

- シナリオ条件を冒頭で明確化
- ステップ形式（発生直後 / 1 時間後 / 24 時間後 等）で提示
- 想定の前提条件を明示し、断定を避ける
- 公的データ（J-SHIS、自治体ハザードマップ）の参照を促す

## 5. Disaster Learning Agent

### 5.1 役割

平時の **防災知識・FAQ・教育コンテンツ** を提供。子ども向け説明にも対応。

### 5.2 出力指針

- 用語の平易化、必要に応じて図示（マークダウン箇条書き）
- 出典がある事項のみ引用、それ以外は「一般的に」「目安として」を付記
- 危険行動を助長しない

## 6. プロンプト改善フロー

```mermaid
flowchart LR
  M[App Insights で課題発見] --> I[Issue 起票]
  I --> P[プロンプト修正案作成]
  P --> AB[A/B 検証<br/>(intent + 各 agent)]
  AB --> R[レビュー]
  R --> D[本番反映 + バージョン記録]
  D --> M
```

### 6.1 A/B 検証手順

1. 検証用 deployment（または別キー名のプロンプト変数）を用意
2. 代表ケース 20〜30 件を投入
3. 観点：JSON 妥当性（intent）/ 適合性（agent）/ 引用の正しさ / 安全性 / 文体
4. 結果を `docs/prompt-design.md` の「履歴」（任意）に追記

### 6.2 変更ガイドライン

- **破壊的変更**（出力スキーマ変更）はパース側を先に修正
- **小規模文言調整**は単独 PR 可
- 変更時は対象エージェント名・狙い・確認サンプルを PR 説明に記載

## 7. 関連ドキュメント

- [detailed-design.md](./detailed-design.md) §5
- [security-design.md](./security-design.md) §5（Prompt Injection 対策）
- [operations-runbook.md](./operations-runbook.md)
