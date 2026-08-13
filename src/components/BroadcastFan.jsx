const targets = [
  { x: -170, y: -120, d: 0 },
  { x: -20, y: -170, d: 0.15 },
  { x: 150, y: -110, d: 0.3 },
  { x: 190, y: 40, d: 0.45 },
  { x: 120, y: 160, d: 0.6 },
  { x: -60, y: 175, d: 0.75 },
  { x: -190, y: 90, d: 0.9 },
  { x: -150, y: -10, d: 1.05 },
];

export default function BroadcastFan() {
  return (
    <div className="relative mx-auto flex h-[360px] w-[360px] items-center justify-center md:h-[420px] md:w-[420px]">
      {/* orbit rings */}
      <div className="absolute h-[85%] w-[85%] rounded-full border border-dashed border-[color:var(--color-emerald)]/25" />
      <div className="absolute h-[55%] w-[55%] rounded-full border border-dashed border-[color:var(--color-emerald)]/30" />

      {/* flying mini bubbles */}
      {targets.map((t, i) => (
        <span
          key={i}
          className="bubble-fan absolute flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-emerald)] text-cream shadow-md"
          style={{
            "--tx": `translate(${t.x}px, ${t.y}px)`,
            animationDelay: `${t.d}s`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 4L3 11l6 2.5M20 4L13 21l-4-7.5M20 4L9 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      ))}

      {/* center bubble: source message */}
      <div className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-[2rem] bg-[color:var(--color-ink)] text-center shadow-xl md:h-48 md:w-48">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-amber)]">1 Klik</span>
        <span className="mt-2 px-4 font-display text-lg font-semibold leading-tight text-cream">
          Broadcast ke Ribuan Kontak
        </span>
      </div>
    </div>
  );
}
