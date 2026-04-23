/**
 * AppBackground
 *
 * ページ全体に敷く背景レイヤー群。
 *   L0 base     — わずかな上下トーン差
 *   L1 wash     — 低彩度の大きな楕円で奥行き（静的）
 *   L3 orb      — 極ゆっくり漂う光の円（prefers-reduced-motion で停止）
 *   L2 noise    — 2.8% の紙ノイズ
 *   L4 vignette — 四隅をわずかに暗く（中央に視線誘導）
 *
 * ホームの `heroAnimal.accent` 連動レイヤーは page.tsx 側で別途上乗せする。
 */
export function AppBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      aria-hidden
    >
      {/* L0 base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.985 0.006 278) 0%, oklch(0.975 0.009 292) 100%)",
        }}
      />

      {/* L1 wash — 低彩度ブロブ */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(70% 55% at 18% -8%, rgba(184, 169, 232, 0.10) 0%, transparent 62%),
            radial-gradient(60% 55% at 108% 105%, rgba(137, 207, 240, 0.09) 0%, transparent 68%)
          `,
        }}
      />

      {/* L3 slow orb */}
      <div
        className="orb-drift absolute left-1/3 top-[-15vh] h-[58vh] w-[58vh] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(242, 181, 212, 0.22) 0%, transparent 70%)",
        }}
      />

      {/* L2 noise — multiply で紙感 */}
      <div className="noise-layer absolute inset-0" />

      {/* L4 vignette — 中央に視線を集める */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 48%, transparent 58%, rgba(32, 20, 80, 0.09) 100%)",
        }}
      />
    </div>
  );
}
