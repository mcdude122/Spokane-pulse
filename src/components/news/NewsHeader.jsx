import { MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function NewsHeader({ onFetchLatest, isLoading, lastUpdated }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="mb-10"
    >
      {/* Location pill */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5"
        style={{
          background: "rgba(125,211,252,0.10)",
          border: "1px solid rgba(125,211,252,0.20)",
          backdropFilter: "blur(12px)",
        }}
      >
        <MapPin className="w-3 h-3" style={{ color: "#7dd3fc" }} />
        <span className="text-xs font-body font-semibold tracking-widest uppercase" style={{ color: "rgba(125,211,252,0.85)" }}>
          Spokane, Washington
        </span>
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          {/* Large SF-style display title */}
          <h1
            className="font-display font-bold leading-none tracking-tight"
            style={{
              fontSize: "clamp(2.6rem, 8vw, 4rem)",
              background: "linear-gradient(145deg, #ffffff 0%, #e0f2fe 35%, #c4b5fd 70%, #f0abfc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 20px rgba(125,211,252,0.25))",
            }}
          >
            Spokane Daily
          </h1>
          <p className="font-body mt-2 text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
            Local news, summarized · no clickbait
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs font-body hidden sm:block" style={{ color: "rgba(255,255,255,0.25)" }}>
              {lastUpdated}
            </span>
          )}

          {/* Latest — tinted glass */}
          <motion.button
            onClick={onFetchLatest}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{
              background: "linear-gradient(160deg, rgba(125,211,252,0.22) 0%, rgba(192,132,252,0.14) 100%)",
              border: "1px solid rgba(125,211,252,0.30)",
              color: "#bae6fd",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 4px 16px rgba(0,0,0,0.20)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Zap className={`w-3.5 h-3.5 ${isLoading ? "animate-pulse" : ""}`} />
            Latest
          </motion.button>


        </div>
      </div>

      {/* Specular divider */}
      <div
        className="mt-7 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 40%, rgba(192,132,252,0.25) 60%, transparent 100%)" }}
      />
    </motion.header>
  );
}