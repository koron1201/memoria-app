# デザイントーン & ビジュアル方針

---

## UIトーン（形容詞5語）

> **やわらかい** / **透明感** / **温かみ** / **夢心地** / **ミニマル**

- 角丸を多用し、鋭角なエッジを避ける
- 背景にグラデーション・ぼかしを用いて奥行きと浮遊感を演出
- 情報密度は低めに保ち、余白を贅沢に使う
- 感情に寄り添うトーンで、プレッシャーを感じさせない

---

## カラーパレット

### メインカラー（3色）

| 名前 | HEX | 用途 |
|------|-----|------|
| **Lavender Dream** | `#B8A9E8` | プライマリカラー。ボタン、アクティブ要素、ブランドカラー |
| **Soft Rose** | `#F2B5D4` | セカンダリカラー。アクセント、感情表現（温かみ） |
| **Ocean Mist** | `#89CFF0` | ターシャリカラー。リンク、情報系UI、短冊背景 |

### アクセントカラー（2色）

| 名前 | HEX | 用途 |
|------|-----|------|
| **Sunset Gold** | `#FFD700` | 目標達成、祝福演出、スター、ハイライト |
| **Coral Pop** | `#FF6B6B` | エラー、警告、重要なCTA |

### 背景カラー（2色）

| 名前 | HEX | 用途 |
|------|-----|------|
| **Snow White** | `#FAFAFE` | メイン背景（ライトモード） |
| **Deep Night** | `#1A1A2E` | ダークモード背景（将来対応） |

### グラデーション

```css
/* メイングラデーション — ヒーローセクション、オンボーディング背景 */
--gradient-main: linear-gradient(135deg, #B8A9E8 0%, #F2B5D4 50%, #89CFF0 100%);

/* カードグラデーション — GlassCard 背景 */
--gradient-card: linear-gradient(135deg, rgba(184, 169, 232, 0.1) 0%, rgba(242, 181, 212, 0.1) 100%);

/* 短冊グラデーション */
--gradient-tanzaku: linear-gradient(180deg, #FFF8E7 0%, #FFE4C4 100%);
```

---

## タイポグラフィ

### フォントファミリー

| 言語 | フォント | ウェイト | 用途 |
|------|----------|----------|------|
| 日本語 | **Noto Sans JP** | 400 / 500 / 700 | 本文 / 見出し |
| 英語 | **Inter** | 400 / 500 / 600 / 700 | UI要素 / 数値 / ラベル |

### フォントサイズ体系

```css
--text-xs:   0.75rem;   /* 12px — キャプション */
--text-sm:   0.875rem;  /* 14px — 補助テキスト */
--text-base: 1rem;      /* 16px — 本文 */
--text-lg:   1.125rem;  /* 18px — 小見出し */
--text-xl:   1.25rem;   /* 20px — セクション見出し */
--text-2xl:  1.5rem;    /* 24px — ページタイトル */
--text-3xl:  1.875rem;  /* 30px — ヒーローテキスト */
```

### Tailwind 設定

```js
// tailwind.config.ts の fontFamily 部分
fontFamily: {
  sans: ['"Noto Sans JP"', '"Inter"', 'system-ui', 'sans-serif'],
},
```

---

## Glassmorphism / Liquid Glass の活用

### 適用箇所

| コンポーネント | 適用度合い | 説明 |
|----------------|------------|------|
| `GlassCard` | 強 | 日記カード、動物カード、短冊カードの基盤 |
| `BottomNav` | 中 | ナビゲーションバーの背景 |
| `Modal / Dialog` | 強 | オーバーレイ時の背景ぼかし |
| `Avatar Container` | 弱 | アバター周囲のオーラ表現 |

### CSS 基本パターン

```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.glass-nav {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}
```

---

## アバタービジュアルスタイル

### 推奨案: SVGアニメーション（2D イラスト風）

| 項目 | 内容 |
|------|------|
| スタイル | フラットな2Dイラスト + SVGアニメーション |
| 頭身 | 2〜3頭身（デフォルメ）|
| 色使い | パステルカラー、メインカラーパレットに準拠 |
| 表情バリエーション | 6感情モードに対応（`mood.ts` の `MOODS` と一致） |

### 感情連動の仕様

`frontend/src/lib/mood.ts` の `MOODS` 順。3D 実装時は各 `glb` に準拠。

| 感情状態（label） | アバター変化（2D/SVG 案） |
|------------------|-------------------------|
| 自由っぽい（🐱 ネコ） | 耳が猫耳に / ゆったりした動き |
| 穏やか（🐻 クマ） | ぽっちゃり化 / ゆっくり揺れる |
| 好奇心旺盛（🦊 キツネ） | 尻尾出現 / キョロキョロ動く |
| 寂しい・不安（🐭 ネズミ） | 耳が垂れる / 色味が青寄りに |
| 親しみ（🐶 イヌ） | しっぽ・耳の動き / 寄り添うポーズ |
| 愛らしい（🐧 ペンギン） | 小さくバウンド / 群れ・仲間を連想する演出 |

### MVP 実装方針

- Phase 1: 静的SVGアバター 1種（表情固定）
- Phase 2: 感情に応じた表情差し替え（6種の静的SVG切り替え）
- Phase 4（Should）: Framer Motion でまばたき・揺れのアニメーション追加

### 代替案: Lottie アニメーション

- LottieFiles から無料素材を活用する手もある
- メリット: アニメーション品質が高い、実装コスト低
- デメリット: カスタマイズ性が低い、統一感の担保が難しい

---

## 動物キャラクターのビジュアル

`mood.ts` の `accent` と一致（UI のハイライト・オーラに使用）。

| 動物（絵文字） | イラストトーン | カラーアクセント（HEX） |
|---------------|---------------|------------------------|
| 🐱 ネコ | しなやか、気まま | `#B8A9E8`（Lavender Dream） |
| 🐻 クマ | まるっこい、安心 | `#F2B5D4`（Soft Rose） |
| 🦊 キツネ | シャープ、知的 | `#89CFF0`（Ocean Mist） |
| 🐭 ネズミ | ふわふわ、繊細 | `#B8A9E8`（Lavender Dream） |
| 🐶 イヌ | なつっこい、明るい | `#89CFF0`（Ocean Mist） |
| 🐧 ペンギン | ぷくっとした愛らしさ | `#B8A9E8`（Lavender Dream） |

### MBTI風カードデザイン

```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   [動物イラスト]       │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│   気まぐれネコ               │
│   〜 自由を愛する冒険家 〜    │
│                             │
│   ┌─ 性格特性 ─────────┐   │
│   │ 好奇心   ★★★★☆   │   │
│   │ 社交性   ★★☆☆☆   │   │
│   │ 冒険心   ★★★★★   │   │
│   │ 繊細さ   ★★★☆☆   │   │
│   │ マイペース ★★★★★   │   │
│   └─────────────────────┘   │
│                             │
│   今日の感情メモ:            │
│   「自由気ままに過ごした      │
│     穏やかな午後」           │
│                             │
│        [シェアする]          │
└─────────────────────────────┘
```

---

## アニメーション方針

### Framer Motion 基本設定

```tsx
// 共通のトランジション定数
export const transitions = {
  default: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  gentle:  { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  bouncy:  { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  slow:    { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
} as const;

// ページ遷移
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: transitions.gentle,
};

// カード表示（スタガー）
export const cardStagger = {
  container: { transition: { staggerChildren: 0.08 } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: transitions.default },
  },
};
```

### アニメーション適用箇所

| 箇所 | 種類 | トランジション | 優先度 |
|------|------|----------------|--------|
| ページ遷移 | フェードイン + スライドアップ | `gentle` | 🔴 Must |
| カード表示 | スタガードフェードイン | `default` + stagger | 🔴 Must |
| ボタンタップ | スケールバウンス | `bouncy` | 🟡 Should |
| ローディング | パルスアニメーション | CSS animation | 🔴 Must |
| アバターまばたき | SVG path アニメーション | `slow` + repeat | 🔵 Could |
| 動物カード登場 | スケールアップ + 回転 | `bouncy` | 🟡 Should |
| 短冊書き込み | 筆跡風テキスト出現 | `slow` | 🔵 Could |
| 達成祝福 | パーティクル + スケール | `bouncy` + confetti | 🔵 Could |

### 速度感の方針

- 全体的に **ゆったり・やわらか** な動きを基調とする
- 急激なトランジションは避け、ease-out 系のイージングを多用
- マイクロインタラクション（ボタン等）のみ `bouncy` で遊びを入れる
- ローディングは焦りを感じさせない速度（1.5〜2秒サイクル）

---

## shadcn/ui カスタマイズ方針

### テーマ変数のオーバーライド

```css
/* globals.css */
@layer base {
  :root {
    --background: 240 20% 98%;        /* #FAFAFE */
    --foreground: 240 10% 15%;

    --primary: 256 50% 78%;            /* #B8A9E8 */
    --primary-foreground: 0 0% 100%;

    --secondary: 330 70% 85%;          /* #F2B5D4 */
    --secondary-foreground: 240 10% 15%;

    --accent: 207 80% 75%;             /* #89CFF0 */
    --accent-foreground: 240 10% 15%;

    --destructive: 0 65% 70%;          /* #FF6B6B */
    --destructive-foreground: 0 0% 100%;

    --card: 0 0% 100% / 0.15;
    --card-foreground: 240 10% 15%;

    --border: 0 0% 100% / 0.25;
    --ring: 256 50% 78%;

    --radius: 1rem;
  }
}
```

### コンポーネント拡張

- `Button`: `variant="glass"` を追加（Glassmorphism ボタン）
- `Card`: デフォルトで `backdrop-filter` 適用
- `Input`: フォーカス時にグロー + ボーダーカラー変化
- `Dialog`: 背景ぼかし強め（`blur(24px)`）
