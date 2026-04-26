import { Clock, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";

const categoryConfig = {
  politics:  { accent: "rgba(96,165,250,0.18)",  border: "rgba(96,165,250,0.22)",  text: "#93c5fd", dot: "#60a5fa" },
  crime:     { accent: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.20)", text: "#fca5a5", dot: "#f87171" },
  sports:    { accent: "rgba(74,222,128,0.15)",  border: "rgba(74,222,128,0.20)",  text: "#86efac", dot: "#4ade80" },
  business:  { accent: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.20)",  text: "#fde68a", dot: "#fbbf24" },
  community: { accent: "rgba(192,132,252,0.15)", border: "rgba(192,132,252,0.20)", text: "#d8b4fe", dot: "#c084fc" },
  weather:   { accent: "rgba(34,211,238,0.15)",  border: "rgba(34,211,238,0.20)",  text: "#a5f3fc", dot: "#22d3ee" },
  education: { accent: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.20)", text: "#f9a8d4", dot: "#f472b6" },
  game:      { accent: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.20)",  text: "#6ee7b7", dot: "#34d399" },
  injury:    { accent: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.20)",  text: "#fdba74", dot: "#fb923c" },
  roster:    { accent: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.20)",  text: "#7dd3fc", dot: "#38bdf8" },
  trade:     { accent: "rgba(250,204,21,0.15)",  border: "rgba(250,204,21,0.20)",  text: "#fef08a", dot: "#facc15" },
  draft:     { accent: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.20)", text: "#c4b5fd", dot: "#a78bfa" },
  coaching:  { accent: "rgba(240,171,252,0.15)", border: "rgba(240,171,252,0.20)", text: "#f5d0fe", dot: "#f0abfc" },
  training:  { accent: "rgba(45,212,191,0.15)",  border: "rgba(45,212,191,0.20)",  text: "#99f6e4", dot: "#2dd4bf" },
  general:   { accent: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.18)", text: "#cbd5e1", dot: "#94a3b8" },
  product:   { accent: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.20)",  text: "#a5b4fc", dot: "#6366f1" },
  software:  { accent: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.20)",  text: "#7dd3fc", dot: "#38bdf8" },
  services:  { accent: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.20)",  text: "#6ee7b7", dot: "#34d399" },
  earnings:  { accent: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.20)",  text: "#fde68a", dot: "#fbbf24" },
  legal:     { accent: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.20)", text: "#fca5a5", dot: "#f87171" },
  privacy:   { accent: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.20)", text: "#c4b5fd", dot: "#a78bfa" },
  ai:        { accent: "rgba(34,211,238,0.15)",  border: "rgba(34,211,238,0.20)",  text: "#a5f3fc", dot: "#22d3ee" },
};

export default function NewsCard({ story, onClick, onHover, isRead }) {
  const [expanded, setExpanded] = useState(false);
  const category = story.category?.toLowerCase() || "general";
  const cfg = categoryConfig[category] || categoryConfig.general;

  // Track touch start position to distinguish tap vs scroll
  const touchStart = useRef(null);
  const didScroll = useRef(false);

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    didScroll.current = false;
  };

  const handleTouchMove = (e) => {
    if (!touchStart.current) return;
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
    const dx = Math.abs(e.touches[0].clientX - touchStart.current.x);
    if (dy > 8 || dx > 8) didScroll.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!didScroll.current) {
      // It was a tap — fire click
      onClick();
    }
    touchStart.current = null;
  };

  return (
    <div
      onMouseEnter={onHover}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: `linear-gradient(160deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 60%, ${cfg.accent} 100%)`,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: `1px solid ${cfg.border}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.10), 0 4px 24px rgba(0,0,0,0.22)",
        WebkitTapHighlightColor: "transparent",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Specular top shine */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.45) 50%, transparent 90%)" }}
      />

      <div className="relative p-5 md:p-6">
        {/* Category pill + time */}
        <div className="flex items-center gap-2.5 mb-3">
          <span
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-body font-semibold capitalize tracking-wide"
            style={{ background: cfg.accent, border: `1px solid ${cfg.border}`, color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {category}
          </span>
          {story.time_context && (
            <span className="flex items-center gap-1 text-xs font-body" style={{ color: "rgba(255,255,255,0.35)" }}>
              <Clock className="w-3 h-3" />
              {story.time_context}
            </span>
          )}
        </div>

        {/* Headline */}
        <h2
          className="font-display text-xl md:text-2xl font-semibold leading-snug mb-3"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          {story.headline}
        </h2>

        {/* Summary */}
        <p className="font-body text-sm md:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.52)" }}>
          {story.summary}
        </p>

        {story.source && (
          <div className="flex items-center gap-2 mt-4">
            <p className="text-xs font-body italic" style={{ color: "rgba(255,255,255,0.22)" }}>
              {story.source}
            </p>
            {isRead && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#4ade80", flexShrink: 0 }} />}
          </div>
        )}
      </div>
    </div>
  );
}