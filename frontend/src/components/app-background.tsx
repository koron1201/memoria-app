/**
 * AppBackground
 *
 * 全体を「中間明度＋低彩度」の紙面に揃え、彩の出所は1系統（primary 霧 + 単一 orb）に制限。
 * 高級感: 天窓スペキュラー、紙4ストップ、遠景メッシュ、楕円ヴィネット、左右リム＋床の無彩、単一遅漂 orb。
 * prefers-reduced-motion: .orb-drift（globals）で停止。
 */
export function AppBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      aria-hidden
    >
      {/* L0 — 上端のシルク（展示壁の天窓） */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            185deg,
            color-mix(in oklab, white 4.5%, var(--bg-paper-top)) 0%,
            color-mix(in oklab, white 1.2%, transparent) 8%,
            transparent 24%
          )`,
        }}
      />

      {/* L1 — 紙面 4 ストップ（帯状の帯域を出さないよう veil で溶かす） */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            168deg,
            var(--bg-paper-top) 0%,
            var(--bg-paper-mid) 40%,
            var(--bg-paper-veil) 66%,
            var(--bg-paper-bot) 100%
          )`,
        }}
      />

      {/* L2 — 遠景空気 2 点、彩度極小（別色メッシュにしない） */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(90% 58% at 4% 2%, color-mix(in oklab, var(--bg-ambient-lt) 52%, transparent) 0%, transparent 60%),
            radial-gradient(76% 58% at 100% 102%, color-mix(in oklab, var(--bg-ambient-rb) 48%, transparent) 0%, transparent 66%)
          `,
        }}
      />

      {/* L3 — 主光源（primary。トークン1本で他ルート上乗せと加算されにくい） */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(60% 44% at 88% 0%, var(--bg-primary-mist) 0%, transparent 74%)
          `,
        }}
      />

      {/* L4 — 水平ミスト（奥行き。灰色帯を弱める） */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            transparent 0%,
            var(--bg-horizon-mist) 48%,
            transparent 100%
          )`,
          opacity: 0.38,
        }}
      />

      {/* L5 — 単一 orb（大粒ブラー1点のみ。コア＋拡散の二重感） */}
      <div
        className="orb-drift absolute right-[-2%] top-[-24vh] h-[54vh] w-[min(78vh,100vw)] max-w-[100vw] rounded-full blur-[132px]"
        style={{
          background: `
            radial-gradient(
              circle,
              color-mix(in oklab, var(--bg-orb-core) 55%, white) 0%,
              color-mix(in oklab, var(--bg-orb-bloom) 42%, white) 38%,
              transparent 70%
            )
          `,
          opacity: 0.78,
        }}
      />

      {/* L6 — 紙の粒（ノイズ） */}
      <div className="noise-layer absolute inset-0" />

      {/* L7 — 円形ヴィネット（シネマティック闇。中央の抜け幅はトークンで調整可） */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            var(--bg-vignette-spread) at 50% var(--bg-vignette-lift),
            transparent 32%,
            color-mix(in oklab, var(--bg-ink) var(--bg-vignette-ink-amount), transparent) 100%
          )`,
        }}
      />

      {/* L8 — 左右リム＋下方向の深み（無彩。ガラス UI の枠感と同期） */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            var(--bg-rim),
            linear-gradient(180deg, transparent 0%, var(--bg-floor-ink) 100%)
          `,
          opacity: 0.52,
        }}
      />
    </div>
  );
}
