# アーキテクチャ概要（MEMORIA）

ハッカソン向けの短いメモ。詳細は `docs/01`〜`05` の上流設計を正とする。

## 構成

- **frontend**（Next.js 16 App Router）: UI・ルーティング・クライアントからの API 呼び出し。公開可能なキーは `NEXT_PUBLIC_*` のみ。
- **backend**（Hono + Node）: HTTP 層は薄く、`src/services/` にビジネスロジック、`src/db/` にデータアクセスを集約。
- **Supabase**: PostgreSQL（アプリデータ）・Auth・Storage（写真）。フロントは anon key、サーバー側処理は service role（サーバーのみ）。
- **Gemini API**: 感情解析・テキスト生成など（キーは backend のみ）。

## データの流れ（概念）

1. ユーザーが写真とテキストをアップロード（Storage + memories 等のテーブル）。
2. backend が Gemini で解析し、結果を DB に保存。
3. frontend がページ（思い出・動物カード・ロードマップ）を表示。

## リポジトリ境界

- `docs/*`: プロダクト仕様・画面設計。実装前に参照。無断で仕様変更しない。
- 環境変数の実体は `frontend/.env.example` と `backend/.env.example` を参照。ルート `.env.example` は一覧用。
