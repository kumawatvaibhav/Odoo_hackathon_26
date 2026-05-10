import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Search, Filter, ArrowUpDown, LayoutGrid,
  MapPin, Calendar, DollarSign, ChevronRight,
  Plane, Clock, CheckCircle2, XCircle, FileEdit,
  Plus, Sparkles,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth-context";
import { fetchUserTrips } from "@/lib/trips-api";
import type { Trip } from "@/lib/trips-api";

export const Route = createFileRoute("/my-trips")({
  head: () => ({
    meta: [
      { title: "Traveloop — My Trips" },
      { name: "description", content: "View and manage all your travel plans in one place." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: MyTripsPage,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", AUD: "A$",
};

function currSym(code: string) {
  return CURRENCY_SYMBOLS[code] || code;
}

type StatusGroup = "ongoing" | "upcoming" | "completed" | "other";

const STATUS_CONFIG: Record<StatusGroup, {
  label: string;
  icon: typeof Plane;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  ongoing: {
    label: "Ongoing",
    icon: Plane,
    color: "text-teal",
    bgColor: "bg-teal/8",
    borderColor: "border-teal/20",
  },
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200/60",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200/60",
  },
  other: {
    label: "Draft / Cancelled",
    icon: FileEdit,
    color: "text-charcoal/50",
    bgColor: "bg-muted/40",
    borderColor: "border-border/60",
  },
};

function classifyTrip(trip: Trip): StatusGroup {
  const now = new Date();
  const start = trip.start_date ? new Date(trip.start_date) : null;
  const end = trip.end_date ? new Date(trip.end_date) : null;

  if (trip.trip_status === "completed") return "completed";
  if (trip.trip_status === "cancelled") return "other";
  if (trip.trip_status === "ongoing") return "ongoing";

  // Infer from dates if status is draft/planning
  if (start && end) {
    if (now >= start && now <= end) return "ongoing";
    if (now < start) return "upcoming";
    if (now > end) return "completed";
  } else if (start) {
    if (now >= start) return "ongoing";
    if (now < start) return "upcoming";
  }

  return "other";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip, group }: { trip: Trip; group: StatusGroup }) {
  const cfg = STATUS_CONFIG[group];

  return (
    <Link
      to="/itinerary/$tripId"
      params={{ tripId: trip.id }}
      className={`block rounded-2xl border bg-card p-5 shadow-sm hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 ${cfg.borderColor}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-display font-semibold text-charcoal truncate">
            {trip.title}
          </h3>
          {trip.description && (
            <p className="text-xs text-charcoal/50 mt-0.5 line-clamp-2">
              {trip.description}
            </p>
          )}
        </div>
        <div className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 ${cfg.color} ${cfg.bgColor}`}>
          <cfg.icon size={10} />
          {cfg.label}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-charcoal/60">
        {(trip.start_date || trip.end_date) && (
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} className="text-teal" />
            {formatDate(trip.start_date)}
            {trip.start_date && trip.end_date && " → "}
            {trip.start_date && trip.end_date && formatDate(trip.end_date)}
          </span>
        )}

        {trip.total_budget != null && Number(trip.total_budget) > 0 && (
          <span className="inline-flex items-center gap-1">
            <DollarSign size={11} className="text-teal" />
            {currSym(trip.currency)} {Number(trip.total_budget).toLocaleString()}
          </span>
        )}

        {trip.stop_count != null && trip.stop_count > 0 && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} className="text-teal" />
            {trip.stop_count} {trip.stop_count === 1 ? "stop" : "stops"}
          </span>
        )}
      </div>

      {/* View link */}
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-end text-xs font-medium text-teal">
        View itinerary <ChevronRight size={14} className="ml-0.5" />
      </div>
    </Link>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ group, count }: { group: StatusGroup; count: number }) {
  const cfg = STATUS_CONFIG[group];
  return (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      <cfg.icon size={16} className={cfg.color} />
      <h2 className="font-display font-semibold text-charcoal text-lg">
        {cfg.label}
      </h2>
      <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${cfg.color} ${cfg.bgColor}`}>
        {count}
      </span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

type SortOption = "newest" | "oldest" | "name";

function MyTripsPage() {
  const navigate = useNavigate();
  const { user, accessToken, isInitialized } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterStatus, setFilterStatus] = useState<StatusGroup | "all">("all");

  // Fetch trips
  useEffect(() => {
    let active = true;
    if (!accessToken) {
      if (isInitialized) setLoading(false);
      return;
    }

    fetchUserTrips(accessToken)
      .then((data) => { if (active) setTrips(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [accessToken, isInitialized]);

  // Filter, sort, group
  const processedTrips = useMemo(() => {
    let filtered = trips;

    // Search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => classifyTrip(t) === filterStatus);
    }

    // Sort
    if (sortBy === "newest") {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [trips, searchQuery, sortBy, filterStatus]);

  // Group by status
  const grouped = useMemo(() => {
    const groups: Record<StatusGroup, Trip[]> = {
      ongoing: [],
      upcoming: [],
      completed: [],
      other: [],
    };
    processedTrips.forEach((t) => {
      groups[classifyTrip(t)].push(t);
    });
    return groups;
  }, [processedTrips]);

  const displayOrder: StatusGroup[] = ["ongoing", "upcoming", "completed", "other"];
  const hasAnyTrips = processedTrips.length > 0;

  // Auth gate
  if (isInitialized && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Plane size={32} className="text-teal mx-auto mb-3" />
          <h2 className="text-xl font-display font-semibold text-charcoal">Sign in to see your trips</h2>
          <div className="mt-4 flex gap-3 justify-center">
            <a href="/login" className="rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card">Log in</a>
            <a href="/signup" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-charcoal">Sign up</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* ── Header ──────────────────────────────────── */}
          <div className="mb-8 animate-fade-up">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
              <Sparkles size={12} /> Your Journeys
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-charcoal">
              My Trips
            </h1>
            <p className="mt-1 text-charcoal/60 text-sm">
              All your travel plans in one place — search, filter, and jump right back in.
            </p>
          </div>

          {/* ── Toolbar ─────────────────────────────────── */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {/* Search */}
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-sm">
              <Search size={15} className="text-teal shrink-0" />
              <input
                id="trip-search"
                type="text"
                placeholder="Search trips…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/35 outline-none"
              />
            </label>

            {/* Controls */}
            <div className="flex gap-2">
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-charcoal/80 outline-none focus:border-teal cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="other">Draft</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-charcoal/80 outline-none focus:border-teal cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">By name</option>
              </select>

              {/* New trip button */}
              <a
                href="/plan-trip"
                className="rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2 text-xs font-semibold shadow-card inline-flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <Plus size={14} /> New Trip
              </a>
            </div>
          </div>

          {/* ── Content ─────────────────────────────────── */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 animate-pulse">
                  <div className="h-4 w-2/3 bg-muted rounded mb-3" />
                  <div className="h-3 w-1/2 bg-muted/80 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-muted/60 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <XCircle size={32} className="text-destructive/40 mx-auto mb-2" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : !hasAnyTrips ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border/80 bg-card/50 animate-fade-up">
              <Plane size={36} className="text-charcoal/15 mx-auto mb-3" />
              <h3 className="font-display font-semibold text-charcoal text-lg">
                {searchQuery || filterStatus !== "all"
                  ? "No trips match your filters"
                  : "No trips yet"}
              </h3>
              <p className="text-sm text-charcoal/50 mt-1 mb-5">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filter."
                  : "Start planning your first adventure!"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <a
                  href="/plan-trip"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card"
                >
                  <Plus size={16} /> Plan a Trip
                </a>
              )}
            </div>
          ) : (
            <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
              {displayOrder.map((group) => {
                const groupTrips = grouped[group];
                if (groupTrips.length === 0) return null;
                return (
                  <div key={group}>
                    <SectionHeader group={group} count={groupTrips.length} />
                    <div className="space-y-3">
                      {groupTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} group={group} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
