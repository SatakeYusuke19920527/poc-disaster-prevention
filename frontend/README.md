# Frontend (Next.js)

防災マルチエージェントチャットの PoC フロントエンド。Next.js (App Router) + TypeScript + Tailwind CSS。

## ディレクトリ

- `app/` ページ (App Router)
- `components/` 再利用可能な UI コンポーネント
- `lib/` API クライアント・型・セッション管理
- `public/` 静的アセット

## 主要コンポーネント

- `ChatWindow` チャット全体の状態管理
- `MessageList` / `MessageInput` メッセージ表示・入力
- `AgentSelector` `auto` / `furusato` / `disaster-simulation` / `disaster-learning` の選択
- `MapPanel` マップ枠 (実装は今後)
- `LoadingIndicator` / `ErrorMessage`

## API フロー

1. `POST /api/chat/start` で Durable Functions オーケストレーションを起動 (`instanceId` を取得)
2. `GET /api/chat/status/{instanceId}` を完了までポーリング
3. `Completed` で最終回答・選択エージェント・Citations を表示

実装は `lib/api.ts`。バックエンド URL は `NEXT_PUBLIC_API_BASE_URL` で設定。

## セットアップ

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL を編集
npm install
npm run dev
```

## スクリプト

- `npm run dev` 開発サーバー
- `npm run build` 本番ビルド
- `npm run lint` ESLint
- `npm run start` 本番起動

## 設計上の制約

- Azure OpenAI / Azure AI Search / Cosmos DB / Blob Storage を **直接呼び出さない**
- バックエンドは必ず Azure Functions API 経由
- シークレットをフロントエンドに含めない
