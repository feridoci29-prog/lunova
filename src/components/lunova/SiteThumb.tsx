// Mini thumbnail illustrating a user's site in ITS OWN colours (never LUNOVA's theme).
export function SiteThumb({ bg, ink, accent, title, tagline }: { bg: string; ink: string; accent: string; title: string; tagline?: string }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl" style={{ background: bg, color: ink }}>
      <div className="flex items-center justify-between px-4 pt-3 text-[0.6rem] opacity-70"><span className="font-semibold">{title}</span><span>Menu · About · Contact</span></div>
      <div className="px-4 pt-5">
        <div className="text-lg font-semibold leading-tight" style={{ fontFamily: "Georgia, serif" }}>{tagline ?? title}</div>
        <div className="mt-2 h-1.5 w-2/3 rounded-full opacity-20" style={{ background: ink }} />
        <div className="mt-1.5 h-1.5 w-1/2 rounded-full opacity-20" style={{ background: ink }} />
        <div className="mt-3 inline-block h-4 w-16 rounded-full" style={{ background: accent }} />
      </div>
      <div className="absolute inset-x-4 bottom-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <div key={i} className="h-6 rounded-md opacity-10" style={{ background: ink }} />)}
      </div>
    </div>
  );
}
