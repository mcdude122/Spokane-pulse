import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronLeft, Clock, Loader2 } from "lucide-react";

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

export default function ArticleDetail({ story, onClose, prefetched, fetchFullArticle }) {
  const [article, setArticle] = useState(prefetched?.data || null);
  const [loading, setLoading] = useState(!prefetched?.data);
  const [imgError, setImgError] = useState(false);

  const category = story.category?.toLowerCase() || "general";
  const cfg = categoryConfig[category] || categoryConfig.general;



  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (prefetched && prefetched.loading) {
      const interval = setInterval(() => {
        if (!prefetched.loading) {
          clearInterval(interval);
          setArticle(prefetched.data);
          setLoading(false);
        }
      }, 300);
      return () => clearInterval(interval);
    }
    if (prefetched?.data) {
      setArticle(prefetched.data);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchFullArticle(story).then((data) => {
      setArticle(data);
      setLoading(false);
    });
  }, [story.headline]);

  const paragraphs = article?.full_text?.split(/\n+/).filter(Boolean) || [];
  const hasImage = article?.image_url && !imgError;

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      style={{
        background: "linear-gradient(145deg, #04091a 0%, #0a1535 30%, #0e0a28 60%, #060d1f 100%)",
        touchAction: "pan-y",
      }}
    >

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col relative z-40"
      >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,0.10) 0%, transparent 55%)",
        }}
      />

      {/* Back button */}
      <div
        className="sticky top-0 z-10 px-4 pt-12 pb-4"
        style={{
          background: "linear-gradient(to bottom, rgba(4,9,26,0.90) 70%, transparent)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-60 active:opacity-40"
          style={{ 
            background: "rgba(125,211,252,0.15)",
            color: "#7dd3fc",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        {/* Category + time */}
        <div className="flex items-center gap-2.5 mb-4">
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
        <h1
          className="font-display font-bold leading-tight mb-5"
          style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", color: "rgba(255,255,255,0.94)" }}
        >
          {story.headline}
        </h1>

        {/* Hero image */}
        {loading ? (
          <div className="w-full rounded-2xl mb-6 overflow-hidden animate-pulse" style={{ height: 220, background: "rgba(255,255,255,0.07)" }} />
        ) : hasImage ? (
          <div className="w-full rounded-2xl mb-6 overflow-hidden relative" style={{ maxHeight: 300 }}>
            <img
              src={article.image_url}
              alt={article.image_caption || story.headline}
              onError={() => setImgError(true)}
              className="w-full object-cover"
              style={{ maxHeight: 300 }}
            />
            {article.image_caption && (
              <div
                className="absolute bottom-0 inset-x-0 px-4 py-2 text-xs font-body italic"
                style={{
                  background: "linear-gradient(to top, rgba(4,9,26,0.85), transparent)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {article.image_caption}
              </div>
            )}
          </div>
        ) : null}

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#7dd3fc" }} />
            <span className="font-body text-sm" style={{ color: "rgba(186,230,253,0.55)" }}>
              Loading full article…
            </span>
          </div>
        )}

        {/* Article body */}
        {!loading && paragraphs.length > 0 && (
          <div className="space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="font-body text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {story.source && (
          <p className="mt-8 text-xs font-body italic" style={{ color: "rgba(255,255,255,0.22)" }}>
            Source: {story.source}
          </p>
        )}
      </div>
      </motion.div>
    </motion.div>
  );
}