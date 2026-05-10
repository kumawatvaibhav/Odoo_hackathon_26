import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  Heart,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Users,
  MapPin,
  Globe,
  Loader2,
  Plus,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth-context";

// ── Types ──────────────────────────────────────────────────────────
interface PostAuthor {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
}

interface PostTrip {
  title: string;
  city: string | null;
  country: string | null;
}

interface CommunityPost {
  id: string;
  trip_id: string;
  title: string;
  body: string | null;
  cover_image_url: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_featured: boolean;
  published_at: string;
  author: PostAuthor;
  trip: PostTrip;
}

interface PostsResponse {
  posts: CommunityPost[];
  total: number;
  page: number;
  limit: number;
}

// ── API Base ───────────────────────────────────────────────────────
const API_BASE =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000"
    : "http://localhost:3000";

// ── Route ──────────────────────────────────────────────────────────
export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Traveloop" },
      {
        name: "description",
        content:
          "Explore shared trip experiences from travelers around the world. Search, filter, and discover inspiration for your next adventure.",
      },
      { property: "og:title", content: "Community — Traveloop" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap",
      },
    ],
  }),
  component: CommunityPage,
});

// ── Filter/Sort options ────────────────────────────────────────────
const FILTER_OPTIONS = [
  { value: "", label: "All Posts", icon: LayoutGrid },
  { value: "featured", label: "Featured", icon: Star },
  { value: "recent", label: "This Week", icon: Clock },
  { value: "popular", label: "Popular", icon: TrendingUp },
];

const SORT_OPTIONS = [
  { value: "published_at", label: "Newest First" },
  { value: "like_count", label: "Most Liked" },
  { value: "view_count", label: "Most Viewed" },
  { value: "comment_count", label: "Most Discussed" },
];

const GROUP_OPTIONS = [
  { value: "", label: "No Grouping" },
  { value: "city", label: "By City", icon: MapPin },
  { value: "country", label: "By Country", icon: Globe },
  { value: "author", label: "By Author", icon: Users },
];

// ── Component ──────────────────────────────────────────────────────
function CommunityPage() {
  const { user, accessToken } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("published_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [groupBy, setGroupBy] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Dropdown open states
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filter) params.set("filter", filter);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      if (groupBy) params.set("groupBy", groupBy);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`${API_BASE}/api/community?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const data: PostsResponse = json.data;
          setPosts(data.posts);
          setTotal(data.total);
        }
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter, sortBy, sortOrder, groupBy, page, limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, sortBy, sortOrder, groupBy]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getInitials = (author: PostAuthor) =>
    `${author.first_name?.[0] || ""}${author.last_name?.[0] || ""}`.toUpperCase();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Group posts
  const groupedPosts = () => {
    if (!groupBy) return { "": posts };
    const groups: Record<string, CommunityPost[]> = {};
    for (const p of posts) {
      let key = "";
      if (groupBy === "city") key = p.trip.city || "Unknown City";
      else if (groupBy === "country") key = p.trip.country || "Unknown Country";
      else if (groupBy === "author") key = `${p.author.first_name} ${p.author.last_name}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return groups;
  };

  const groups = groupedPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-6">
          {/* ── Header ── */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal mb-3">
              <Sparkles size={14} />
              Community
            </span>
            <h1 className="font-display font-bold text-charcoal text-3xl md:text-5xl tracking-tight">
              Community Hub
            </h1>
            <p className="mt-3 text-charcoal/60 max-w-xl mx-auto">
              Discover shared trip experiences. Search, filter, and find inspiration for your next
              adventure.
            </p>
          </motion.div>

          {/* ── Create Post + Button ── */}
          <motion.div
            className="flex justify-end mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <Link to={user ? "/community-write" : "/login"}>
              <motion.span
                id="create-post-btn"
                className="grid place-items-center w-11 h-11 rounded-full bg-gradient-primary text-primary-foreground shadow-card cursor-pointer"
                whileHover={{
                  scale: 1.1,
                  boxShadow:
                    "0 16px 36px -20px color-mix(in oklab, var(--primary) 50%, transparent)",
                }}
                whileTap={{ scale: 0.92 }}
                title={user ? "Share your experience" : "Sign in to share"}
              >
                <Plus size={20} strokeWidth={2.5} />
              </motion.span>
            </Link>
          </motion.div>

          {/* ── Controls Bar ── */}
          <motion.div
            className="flex flex-wrap items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          >
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40"
              />
              <input
                id="community-search"
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50 transition-all"
              />
            </div>

            {/* Group By */}
            <DropdownControl
              id="community-group-by"
              icon={<LayoutGrid size={14} />}
              label="Group by"
              open={groupOpen}
              onToggle={() => {
                setGroupOpen((o) => !o);
                setFilterOpen(false);
                setSortOpen(false);
              }}
              onClose={() => setGroupOpen(false)}
              options={GROUP_OPTIONS}
              value={groupBy}
              onChange={(v) => {
                setGroupBy(v);
                setGroupOpen(false);
              }}
            />

            {/* Filter */}
            <DropdownControl
              id="community-filter"
              icon={<SlidersHorizontal size={14} />}
              label="Filter"
              open={filterOpen}
              onToggle={() => {
                setFilterOpen((o) => !o);
                setGroupOpen(false);
                setSortOpen(false);
              }}
              onClose={() => setFilterOpen(false)}
              options={FILTER_OPTIONS}
              value={filter}
              onChange={(v) => {
                setFilter(v);
                setFilterOpen(false);
              }}
            />

            {/* Sort */}
            <DropdownControl
              id="community-sort"
              icon={<ArrowUpDown size={14} />}
              label="Sort by"
              open={sortOpen}
              onToggle={() => {
                setSortOpen((o) => !o);
                setGroupOpen(false);
                setFilterOpen(false);
              }}
              onClose={() => setSortOpen(false)}
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(v) => {
                setSortBy(v);
                setSortOpen(false);
              }}
              extra={
                <button
                  onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                  className="w-full text-left px-3 py-2 text-xs text-charcoal/60 hover:bg-muted/60 transition-colors flex items-center gap-2 border-t border-border/60"
                >
                  <ArrowUpDown size={12} />
                  {sortOrder === "desc" ? "Descending ↓" : "Ascending ↑"}
                </button>
              }
            />
          </motion.div>

          {/* ── Posts ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 size={32} className="text-teal" />
              </motion.div>
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-muted grid place-items-center mb-4">
                <MessageCircle size={28} className="text-charcoal/30" />
              </div>
              <h3 className="font-display font-semibold text-charcoal text-lg">No posts yet</h3>
              <p className="mt-1 text-sm text-charcoal/50">
                {debouncedSearch || filter
                  ? "Try adjusting your search or filters."
                  : "Be the first to share your trip experience!"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groups).map(([groupLabel, groupPosts]) => (
                <div key={groupLabel}>
                  {groupLabel && (
                    <motion.div
                      className="flex items-center gap-2 mb-4 mt-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-card border border-border rounded-full px-4 py-1.5">
                        {groupLabel}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {groupPosts.map((post, i) => (
                        <motion.div
                          key={post.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, delay: i * 0.04, ease: "easeOut" }}
                          className={`group relative flex items-start gap-4 rounded-2xl border bg-card p-5 transition-all duration-300 cursor-pointer ${
                            selectedPostId === post.id
                              ? "border-teal/50 shadow-glow ring-2 ring-teal/20"
                              : "border-border hover:border-teal/30 hover:shadow-card"
                          }`}
                          onClick={() =>
                            setSelectedPostId(selectedPostId === post.id ? null : post.id)
                          }
                        >
                          {/* Select indicator */}
                          <div className="pt-1 shrink-0">
                            <div
                              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 grid place-items-center ${
                                selectedPostId === post.id
                                  ? "border-teal bg-teal"
                                  : "border-charcoal/25 group-hover:border-teal/60"
                              }`}
                            >
                              {selectedPostId === post.id && (
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-white"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  {post.is_featured && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                                      <Star size={10} className="fill-amber-500" />
                                      Featured
                                    </span>
                                  )}
                                  {post.trip.city && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal bg-teal/10 rounded-full px-2 py-0.5">
                                      <MapPin size={10} />
                                      {post.trip.city}
                                      {post.trip.country ? `, ${post.trip.country}` : ""}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-display font-semibold text-charcoal text-base md:text-lg leading-snug truncate">
                                  {post.title}
                                </h3>
                                {post.body && (
                                  <p className="mt-1.5 text-sm text-charcoal/55 line-clamp-2 leading-relaxed">
                                    {post.body}
                                  </p>
                                )}
                              </div>

                              {/* Author avatar */}
                              <div className="shrink-0">
                                {post.author.profile_photo_url ? (
                                  <img
                                    src={post.author.profile_photo_url}
                                    alt={`${post.author.first_name} ${post.author.last_name}`}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-bold ring-2 ring-border">
                                    {getInitials(post.author)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Meta row */}
                            <div className="mt-3 flex items-center gap-4 text-xs text-charcoal/45">
                              <span className="font-medium text-charcoal/70">
                                {post.author.first_name} {post.author.last_name}
                              </span>
                              <span>·</span>
                              <span>{formatDate(post.published_at)}</span>
                              <span className="ml-auto" />
                              <span className="inline-flex items-center gap-1">
                                <Heart size={12} className="text-coral" />
                                {post.like_count}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MessageCircle size={12} />
                                {post.comment_count}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Eye size={12} />
                                {post.view_count}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && posts.length > 0 && (
            <motion.div
              className="mt-10 flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid place-items-center w-10 h-10 rounded-xl border border-border bg-card text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                whileHover={page > 1 ? { y: -1, boxShadow: "0 4px 12px -6px rgba(0,0,0,0.15)" } : {}}
                whileTap={page > 1 ? { scale: 0.96 } : {}}
              >
                <ChevronLeft size={16} />
              </motion.button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <motion.button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === pageNum
                          ? "bg-gradient-primary text-primary-foreground shadow-card"
                          : "border border-border bg-card text-charcoal/70 hover:bg-muted"
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="grid place-items-center w-10 h-10 rounded-xl border border-border bg-card text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                whileHover={
                  page < totalPages
                    ? { y: -1, boxShadow: "0 4px 12px -6px rgba(0,0,0,0.15)" }
                    : {}
                }
                whileTap={page < totalPages ? { scale: 0.96 } : {}}
              >
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* ── Results summary ── */}
          {!loading && (
            <p className="text-center text-xs text-charcoal/40 mt-4">
              {total > 0
                ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} post${total !== 1 ? "s" : ""}`
                : "No results found"}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Dropdown Control Component ─────────────────────────────────────
function DropdownControl({
  id,
  icon,
  label,
  open,
  onToggle,
  onClose,
  options,
  value,
  onChange,
  extra,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  options: { value: string; label: string; icon?: any }[];
  value: string;
  onChange: (v: string) => void;
  extra?: React.ReactNode;
}) {
  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById(id);
      if (el && !el.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, id, onClose]);

  const selectedLabel = options.find((o) => o.value === value)?.label || label;

  return (
    <div className="relative" id={id}>
      <motion.button
        onClick={onToggle}
        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
          open || value
            ? "border-teal/40 bg-teal/5 text-teal"
            : "border-border bg-card text-charcoal/70 hover:border-charcoal/30"
        }`}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
      >
        {icon}
        <span className="hidden sm:inline">{value ? selectedLabel : label}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 min-w-[180px] rounded-xl border border-border bg-card shadow-elegant z-50 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                  value === opt.value
                    ? "bg-teal/10 text-teal font-medium"
                    : "text-charcoal/70 hover:bg-muted/60"
                }`}
              >
                {opt.icon && <opt.icon size={14} />}
                {opt.label}
              </button>
            ))}
            {extra}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
