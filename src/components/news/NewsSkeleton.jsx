export default function NewsSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-2xl p-5 md:p-6 overflow-hidden relative"
          style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-4 w-20 rounded-full bg-white/10 animate-pulse" />
            <div className="h-3 w-28 rounded-full bg-white/07 animate-pulse" />
          </div>
          <div className="h-6 w-3/4 rounded-lg bg-white/10 animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-white/07 animate-pulse" />
            <div className="h-4 w-full rounded bg-white/07 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-white/07 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}