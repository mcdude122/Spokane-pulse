import { useCallback, useState, useRef, useEffect } from "react";

import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Newspaper, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import NewsHeader from "../components/news/NewsHeader";
import NewsCard from "../components/news/NewsCard";
import NewsSkeleton from "../components/news/NewsSkeleton";
import ArticleDetail from "../components/news/ArticleDetail";

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});

const fetchSpokaneNews = async () => {
  return base44.integrations.Core.InvokeLLM({
    model: "gemini_3_flash",
    prompt: `You are a local news editor for Spokane, Washington. Today is ${TODAY}.
    
Search for the latest news stories about Spokane, WA from today and the past few days. Include local government, crime, sports, business, community events, weather, and education news.

For each story, provide:
- A clear, informative headline
- A 1-2 sentence summary
- A category (politics, crime, sports, business, community, weather, education, or general)
- A time context: for stories from today use a specific relative time like "3 hours ago" or "45 minutes ago". For older stories use "Yesterday", "2 days ago", etc.
- The source name if identifiable

Return 8-12 news stories, prioritizing the most important and recent ones.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              summary: { type: "string" },
              category: { type: "string" },
              time_context: { type: "string" },
              source: { type: "string" }
            }
          }
        }
      }
    }
  });
};

const fetchAppleNews = async () => {
  return base44.integrations.Core.InvokeLLM({
    model: "gemini_3_flash",
    prompt: `You are a tech journalist covering Apple Inc. Today is ${TODAY}.

Search for the latest Apple news from today and the past few days. Cover new product announcements, iOS/macOS updates, App Store changes, Apple services, earnings, legal news, supply chain, and executive news.

For each story, provide:
- A clear, informative headline
- A 1-2 sentence summary
- A category — use one of: product, software, services, earnings, legal, privacy, ai, general
- A time context: for stories from today use a specific relative time like "3 hours ago" or "45 minutes ago". For older stories use "Yesterday", "2 days ago", etc.
- The source name if identifiable

Return 8-12 news stories, prioritizing the most important and recent ones.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              summary: { type: "string" },
              category: { type: "string" },
              time_context: { type: "string" },
              source: { type: "string" }
            }
          }
        }
      }
    }
  });
};

const fetchSeahawksNews = async () => {
  return base44.integrations.Core.InvokeLLM({
    model: "gemini_3_flash",
    prompt: `You are a Seattle Seahawks beat reporter. Today is ${TODAY}.

Search for the latest Seattle Seahawks news from today and the past few days. Cover roster moves, injuries, game results, upcoming games, trades, draft news, coaching updates, and player performance.

For each story, provide:
- A clear, informative headline
- A 1-2 sentence summary
- A category — use one of: game, injury, roster, trade, draft, coaching, training, general
- A time context: for stories from today use a specific relative time like "3 hours ago" or "45 minutes ago". For older stories use "Yesterday", "2 days ago", etc.
- The source name if identifiable

Return 8-12 news stories, prioritizing the most important and recent ones.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              summary: { type: "string" },
              category: { type: "string" },
              time_context: { type: "string" },
              source: { type: "string" }
            }
          }
        }
      }
    }
  });
};

const fetchFullArticle = async (story) => {
  return base44.integrations.Core.InvokeLLM({
    model: "gemini_3_flash",
    prompt: `You are a journalist. Today is ${TODAY}.

The user wants to read the full article for this news story:
Headline: "${story.headline}"
Summary: "${story.summary}"
Category: "${story.category}"
Source: "${story.source || "unknown"}"

Search the web for this specific story and write a full, detailed article about it (4-8 paragraphs). Also find a relevant image URL — ONLY use images from Wikipedia or Wikimedia Commons (upload.wikimedia.org) as they allow hotlinking. Search Wikipedia for a relevant person, team, or place related to this story and use their image URL directly.

Return:
- full_text: the full article body (no headline, just body paragraphs separated by newlines)
- image_url: a direct https://upload.wikimedia.org/... image URL from Wikipedia/Wikimedia Commons, or empty string if none found
- image_caption: short caption for the image`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        full_text: { type: "string" },
        image_url: { type: "string" },
        image_caption: { type: "string" },
      }
    }
  });
};

const TABS = [
  { key: "spokane", label: "Spokane", emoji: "🏙️" },
  { key: "seahawks", label: "Seahawks", emoji: "🦅" },
  { key: "apple", label: "Apple", emoji: "🍎" },
];

const TIME_ORDER = ["today", "yesterday", "2 days ago", "3 days ago", "4 days ago", "5 days ago", "6 days ago", "1 week ago", "last week"];

function getTimeRank(timeContext) {
  const t = (timeContext || "").toLowerCase().trim();
  // Minutes ago → fraction of an hour (ranks before hours)
  const minMatch = t.match(/^(\d+)\s+minutes?\s+ago$/);
  if (minMatch) return parseInt(minMatch[1]) / 60;
  // Hours ago → ranks as fractional days (less than 1)
  const hrMatch = t.match(/^(\d+)\s+hours?\s+ago$/);
  if (hrMatch) return parseInt(hrMatch[1]) / 24;
  const idx = TIME_ORDER.indexOf(t);
  if (idx !== -1) return idx;
  // Handle "X days ago" patterns not in the list
  const dayMatch = t.match(/^(\d+)\s+days?\s+ago$/);
  if (dayMatch) return parseInt(dayMatch[1]);
  return 999;
}

function sortByNewest(stories) {
  return [...stories].sort((a, b) => getTimeRank(a.time_context) - getTimeRank(b.time_context));
}

const CACHE_KEY_SPOKANE = "spokane-news-cache";
const CACHE_KEY_SEAHAWKS = "seahawks-news-cache";
const CACHE_KEY_APPLE = "apple-news-cache";

function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function saveToStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("spokane");
  const [selectedStory, setSelectedStory] = useState(null);
  const [readArticles, setReadArticles] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("read-articles") || "[]"));
    } catch {
      return new Set();
    }
  });
  const queryClient = useQueryClient();
  const scrollY = useMotionValue(0);
  const pullDown = useRef(0);
  const contentRef = useRef(null);
  const [refetchingTabs, setRefetchingTabs] = useState({});

  // Seed query cache from localStorage before first render
  const seeded = useRef(false);
  if (!seeded.current) {
    seeded.current = true;
    const cachedSpokane = loadFromStorage(CACHE_KEY_SPOKANE);
    const cachedSeahawks = loadFromStorage(CACHE_KEY_SEAHAWKS);
    const cachedApple = loadFromStorage(CACHE_KEY_APPLE);
    if (cachedSpokane) queryClient.setQueryData(["spokane-news"], cachedSpokane);
    if (cachedSeahawks) queryClient.setQueryData(["seahawks-news"], cachedSeahawks);
    if (cachedApple) queryClient.setQueryData(["apple-news"], cachedApple);
  }

  // Article prefetch cache: headline -> {data, loading}
  const articleCache = useRef({});

  const spokane = useQuery({
    queryKey: ["spokane-news"],
    queryFn: fetchSpokaneNews,
    staleTime: Infinity,      // never auto-refetch
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  const seahawks = useQuery({
    queryKey: ["seahawks-news"],
    queryFn: fetchSeahawksNews,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  const apple = useQuery({
    queryKey: ["apple-news"],
    queryFn: fetchAppleNews,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    retry: 1,
    networkMode: 'always',
  });

  // Persist to localStorage whenever fresh data arrives
  useEffect(() => {
    if (spokane.data) saveToStorage(CACHE_KEY_SPOKANE, spokane.data);
  }, [spokane.data]);

  useEffect(() => {
    if (seahawks.data) saveToStorage(CACHE_KEY_SEAHAWKS, seahawks.data);
  }, [seahawks.data]);

  useEffect(() => {
    if (apple.data) saveToStorage(CACHE_KEY_APPLE, apple.data);
  }, [apple.data]);

  const active = activeTab === "spokane" ? spokane : activeTab === "seahawks" ? seahawks : apple;

  const activeCache = activeTab === "spokane" ? CACHE_KEY_SPOKANE : activeTab === "seahawks" ? CACHE_KEY_SEAHAWKS : CACHE_KEY_APPLE;
  const cachedData = loadFromStorage(activeCache);
  const isLoading = active.isLoading && !cachedData;
  const isRefetching = active.isFetching;
  // Fall back to localStorage data if React Query cache was reset but fetch is in-flight
  const stories = sortByNewest(active.data?.stories || cachedData?.stories || []);

  // Auto-prefetch top 5 articles when stories load
  useEffect(() => {
    if (stories.length > 0) {
      stories.slice(0, 5).forEach((story) => {
        const key = story.headline;
        if (!articleCache.current[key]) {
          articleCache.current[key] = { data: null, loading: true };
          fetchFullArticle(story).then((data) => {
            articleCache.current[key] = { data, loading: false };
          }).catch(() => {
            articleCache.current[key] = { data: null, loading: false };
          });
        }
      });
    }
  }, [stories.length > 0 ? stories[0]?.headline : null]);

  const lastUpdated = active.dataUpdatedAt
    ? new Date(active.dataUpdatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : null;

  const handleRefresh = useCallback(() => {
    setRefetchingTabs(prev => ({ ...prev, [activeTab]: true }));
    const query = activeTab === "spokane" ? spokane : activeTab === "seahawks" ? seahawks : apple;
    query.refetch().finally(() => setRefetchingTabs(prev => ({ ...prev, [activeTab]: false })));
  }, [activeTab, spokane, seahawks, apple]);

  // Store refs for touch handlers to access current state
  const stateRef = useRef({ activeTab, spokane, seahawks, apple });
  useEffect(() => {
    stateRef.current = { activeTab, spokane, seahawks, apple };
  }, [activeTab, spokane, seahawks, apple]);

  const handleTouchStart = (e) => {
    // Allow pull-to-refresh if we're at the top or within the first 50px of scroll
    if (contentRef.current && contentRef.current.scrollTop <= 0) {
      pullDown.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (pullDown.current === 0) return;
    const dy = e.touches[0].clientY - pullDown.current;
    // Only allow pull-down, require at least 10px to start showing indicator
    if (dy > 10 && dy < 160) {
      scrollY.set(dy);
    } else if (dy <= 0) {
      scrollY.set(0);
      pullDown.current = 0;
    }
  };

  const handleTouchEnd = () => {
    const distance = scrollY.get();
    // Require 120px pull to trigger (more intentional than 80px)
    if (distance > 120) {
      const { activeTab: tab, spokane: s, seahawks: sh, apple: a } = stateRef.current;
      setRefetchingTabs(prev => ({ ...prev, [tab]: true }));
      const query = tab === "spokane" ? s : tab === "seahawks" ? sh : a;
      query.refetch().finally(() => setRefetchingTabs(prev => ({ ...prev, [tab]: false })));
    }
    animate(scrollY, 0, { duration: 0.3 });
    pullDown.current = 0;
  };



  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "linear-gradient(145deg, #04091a 0%, #0a1535 30%, #0e0a28 60%, #060d1f 100%)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Static mesh gradient — no animation, no blur filter, GPU-free */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,0.10) 0%, transparent 55%)",
        }}
      />


      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 safe-area-inset">
        {/* Pull-to-refresh indicator */}
        <motion.div
          className="flex items-center justify-center h-12 overflow-hidden"
          style={{ opacity: useTransform(scrollY, [0, 80], [0, 1]) }}
        >
          <motion.div
            className="text-center flex flex-col items-center gap-1"
            style={{ y: useTransform(scrollY, [0, 80], [20, 0]) }}
          >
            <p className="text-xs font-body" style={{ color: "rgba(186,230,253,0.7)" }}>
              {scrollY.get() > 80 ? "Release to refresh" : "Pull down to refresh"}
            </p>
            <motion.div style={{ rotate: useTransform(scrollY, [0, 80], ["180deg", "0deg"]) }}>
              <ChevronDown className="w-3 h-3" style={{ color: "rgba(186,230,253,0.7)" }} />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          ref={contentRef}
          className="pt-14 pb-16"
          style={{ y: scrollY }}
        >
          <NewsHeader
          onFetchLatest={() => handleRefresh()}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />

        {/* iOS-style segmented pill tab */}
        <div
          className="flex gap-1 mb-8 p-1 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-semibold transition-colors duration-200"
              style={
                activeTab === tab.key
                  ? {
                      background: "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)",
                      color: "#ffffff",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.40), 0 2px 12px rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      WebkitTapHighlightColor: "transparent",
                    }
                  : {
                      color: "rgba(255,255,255,0.40)",
                      border: "1px solid transparent",
                      WebkitTapHighlightColor: "transparent",
                    }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && !refetchingTabs[activeTab] && <NewsSkeleton />}

        {(isRefetching || refetchingTabs[activeTab]) && (
          <div className="flex items-center gap-2 mb-5 px-1 text-xs font-body" style={{ color: "rgba(186,230,253,0.55)" }}>
            <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
            Fetching latest news…
          </div>
        )}

        {active.error && stories.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-red-300/70 text-sm">
              Something went wrong loading the news. Please try refreshing.
            </p>
          </div>
        )}

        {!isLoading && !active.error && stories.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="w-10 h-10 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.15)" }} />
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.30)" }}>
              No stories found. Hit refresh to load the latest news.
            </p>
          </div>
        )}

        {!isLoading && stories.length > 0 && (
          <div className="space-y-3">
            {stories.map((story, index) => (
              <NewsCard
                key={index}
                story={story}
                index={index}
                isRead={readArticles.has(story.headline)}
                onClick={() => {
                  setSelectedStory(story);
                  const newRead = new Set(readArticles);
                  newRead.add(story.headline);
                  setReadArticles(newRead);
                  localStorage.setItem("read-articles", JSON.stringify(Array.from(newRead)));
                }}
                onHover={() => {
                  const key = story.headline;
                  if (!articleCache.current[key]) {
                    articleCache.current[key] = { data: null, loading: true };
                    fetchFullArticle(story).then((data) => {
                      articleCache.current[key] = { data, loading: false };
                    }).catch(() => {
                      articleCache.current[key] = { data: null, loading: false };
                    });
                  }
                }}
              />
            ))}
          </div>
        )}

        <footer className="mt-16 text-center">
          <div className="h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
          <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
            Spokane Daily · AI-curated local news
          </p>
        </footer>
        </motion.div>
      </div>
      <AnimatePresence>
        {selectedStory && (
          <ArticleDetail
            story={selectedStory}
            onClose={() => setSelectedStory(null)}
            prefetched={articleCache.current[selectedStory.headline] || null}
            fetchFullArticle={fetchFullArticle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}