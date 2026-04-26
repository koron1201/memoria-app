/**
 * ProfileHalo
 *
 * マイページにだけ 1 系の上乗せ（大きい radial のみ。副ブロブは廃止して濁りを防ぐ）。
 * AppBackground との合算でも彩は primary + secondary からの混色1回に収める。
 */
export function ProfileHalo() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[58vh] overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-[-32vh] h-[min(100vw,92vh)] w-[min(100vw,92vh)] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(
            circle at 50% 42%,
            color-mix(in oklab, var(--primary) 12%, transparent) 0%,
            color-mix(in oklab, var(--secondary) 3.2%, transparent) 38%,
            transparent 58%
          )`,
          filter: "blur(92px)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[30vh]"
        style={{
          background: `linear-gradient(
            180deg,
            transparent 0%,
            color-mix(in oklab, var(--background) 90%, var(--bg-paper-mid)) 100%
          )`,
        }}
      />
    </div>
  );
}
