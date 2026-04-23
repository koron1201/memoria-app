# MEMORIA — 写真×AI×感情で「思い出の1ページ」を自動生成するアプリ

> 写真とひとことテキストから AI が感情を解析し、日記を自動生成。  
> 感情は動物キャラクターとして可視化され、夢はロードマップに変わる。  
> ハッカソン期間（2026年4月16日〜4月29日）に MVP を完成させるプロジェクト。

---

## 技術スタック

| 区分 | 技術 |
|------|------|
| **フロントエンド** | Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS v4 / shadcn/ui / Framer Motion |
| **バックエンド** | Supabase (PostgreSQL / Auth / Storage) / Gemini API |
| **デプロイ** | Vercel |

---

## セットアップ

### 前提条件

- Node.js 20+
- npm or pnpm
- Supabase プロジェクト（Auth / DB / Storage）
- Gemini API キー

### Step 1: リポジトリクローン

```bash
git clone <repository-url>
cd memoria-app
```

### Step 2: フロントエンド

```bash
cd frontend
npm install
cp .env.example .env.local  # 環境変数を設定
npm run dev                  # http://localhost:3000
```

### Step 3: バックエンド

```bash
cd backend
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3001
```

### 環境変数（一覧）

- ルートの **`.env.example`** にフロント・バックエンドのキーをコメント付きで列挙（値は書かない）。
- 実際の設定は **`frontend/.env.example`** / **`backend/.env.example`** をコピーして各 `frontend/.env.local` と `backend/.env.local` に記入する。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

---

## CI

GitHub Actions（`.github/workflows/ci.yml`）で `frontend` / `backend` の lint と build を実行する。

---

## アーキテクチャ

概要のみ **`docs/ARCHITECTURE.md`**。仕様の正は `docs/01`〜`05`。

---

## ディレクトリ構成

```
memoria-app/
├── frontend/                  # フロントエンド（Next.js）
│   ├── src/
│   │   ├── app/               # App Router ページ
│   │   │   ├── page.tsx       # ホーム（/）
│   │   │   ├── onboarding/    # オンボーディング
│   │   │   ├── upload/        # 写真アップロード
│   │   │   ├── memory/[id]/   # 思い出の1ページ
│   │   │   ├── animal-card/[id]/ # 動物カード詳細
│   │   │   ├── tanzaku/       # 短冊入力
│   │   │   ├── roadmap/[id]/  # ロードマップ
│   │   │   └── profile/       # プロフィール
│   │   ├── components/        # UIコンポーネント
│   │   │   ├── ui/            # shadcn/ui ベースコンポーネント
│   │   │   ├── avatar.tsx
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── glass-card.tsx
│   │   │   └── page-header.tsx
│   │   └── lib/               # ユーティリティ
│   │       ├── utils.ts
│   │       └── motion.ts      # Framer Motion 共通定数
│   ├── public/                # 静的アセット
│   ├── package.json
│   └── next.config.ts
│
├── backend/                   # バックエンド（API・ビジネスロジック）
│   ├── src/
│   │   ├── routes/            # APIルートハンドラー
│   │   ├── services/          # ビジネスロジック（AI解析・感情分析）
│   │   ├── db/                # データベーススキーマ・クエリ
│   │   └── lib/               # ユーティリティ（Supabase クライアント等）
│   └── package.json
│
├── docs/                      # 上流設計ドキュメント
│   ├── 01_user-persona.md
│   ├── 02_user-story-map.md
│   ├── 03_screen-architecture.md
│   ├── 04_implementation-timeline.md
│   └── 05_design-direction.md
│
│── docker-compose.yml
│
│── Dockerfile.dev
│
├── .env.example               # 環境変数キー一覧（ルート参照用）
├── .github/workflows/ci.yml   # CI（lint / build）
└── README.md                  # このファイル
```

---

## コア機能

### 1. MEMORIA（思い出の記録）

写真 + ひとことテキスト → AI 感情解析 → 「思い出の1ページ」自動生成

### 2. 動物キャラクター（感情の可視化）

| 感情状態 | 動物 | キャッチコピー |
|----------|------|---------------|
| 自由っぽい | 🐱 ネコ | 気まぐれに世界を歩く |
| 寂しい・不安 | 🐰 ウサギ | そっと寄り添う、繊細な心 |
| 元気・活発 | 🦁 | 太陽のように輝く情熱 |
| 穏やか・安定 | 🐻 クマ | どっしり構えた安心感 |
| 好奇心旺盛 | 🦊 キツネ | 知りたがりの探究者 |

### 3. 短冊ドリームロード（夢のロードマップ）

短冊に夢を書く → AI がスモールステップに分解 → ロードマップ生成

---

## チーム役割分担

**ハッカソン期間**: 2026年4月16日〜2026年4月29日（全14日間）

| メンバー | 主担当 | 担当領域 |
|----------|--------|----------|
| **A** | フロントエンド | ホーム / アップロード / 日記ビュー / 動物カード |
| **B** | バックエンド | API / Supabase / AI連携 |
| **C** | フロントエンド補助 + デザイン | オンボーディング / 短冊 / ロードマップ / プロフィール |

---

## 設計ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| `docs/01_user-persona.md` | ターゲットユーザー（大学2年生 佐藤ゆい） |
| `docs/02_user-story-map.md` | 全ストーリー一覧（Must 15本 / Should 9本 / Could 4本） |
| `docs/03_screen-architecture.md` | 画面遷移図 & 8画面の情報設計 |
| `docs/04_implementation-timeline.md` | ハッカソン期間のタイムライン・役割分担 |
| `docs/05_design-direction.md` | カラーパレット・タイポグラフィ・Glassmorphism 方針 |
| `docs/ARCHITECTURE.md` | フロント・バック・Supabase・Gemini の短い構成メモ |

---

## デザイントーン

> **やわらかい** / **透明感** / **温かみ** / **夢心地** / **ミニマル**

| カラー | HEX | 用途 |
|--------|-----|------|
| Lavender Dream | `#B8A9E8` | プライマリ |
| Soft Rose | `#F2B5D4` | セカンダリ |
| Ocean Mist | `#89CFF0` | ターシャリ |

---
## GitHub に Push するまでの流れ
1. **変更する** — エディタなどでファイルを編集する。
2. **状態確認** — `git status` で変更・未追跡を確認。
3. **ステージ** — `git add .` または `git add <ファイル>`。
4. **コミット** — `git commit -m "変更内容の短い説明"`。
5. **プッシュ**
   - ブランチを初めて送るとき: `git push -u origin <ブランチ名>`（例: `master`）
   - 2回目以降: `git push`
6. **確認** — GitHub 上でコミット・ブランチが更新されているか見る。
### 補足
- リモートをまだ登録していない場合: `git remote add origin <リポジトリURL>` のあと上記 3〜5。
- 他の人の変更を取り込む場合: `push` の前に `git pull`（必要ならコンフリクト解消）。
- Windows で **`nul` という名前のファイル**があると `git add` が失敗することがある（予約名のため）。その場合は先に削除してから `git add`。

7. **ブランチ(dev/main)から分岐する**
- git fetch origin
- git checkout dev
- git pull origin dev(dev/mainを最新状態にするため)
- git checkout -b your-branch-name