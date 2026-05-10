import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  Sparkles,
  Globe,
  DollarSign,
  X,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth-context";
import { fetchCities, createTrip } from "@/lib/trips-api";
import type { City } from "@/lib/trips-api";
import banner from "@/assets/hero-banner.jpg";

export const Route = createFileRoute("/plan-trip")({
  head: () => ({
    meta: [
      { title: "Traveloop — Plan a New Trip" },
      {
        name: "description",
        content:
          "Create a personalised multi-city trip loop, pick your dates, set a budget, and explore curated destination suggestions.",
      },
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
  component: PlanTripPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  romantic: "bg-pink-100 text-pink-700",
  historic: "bg-amber-100 text-amber-700",
  art: "bg-purple-100 text-purple-700",
  food: "bg-orange-100 text-orange-700",
  beach: "bg-sky-100 text-sky-700",
  nature: "bg-green-100 text-green-700",
  culture: "bg-indigo-100 text-indigo-700",
  luxury: "bg-yellow-100 text-yellow-700",
  adventure: "bg-red-100 text-red-700",
  nightlife: "bg-violet-100 text-violet-700",
  shopping: "bg-teal-100 text-teal-700",
  temples: "bg-stone-100 text-stone-700",
  technology: "bg-blue-100 text-blue-700",
  urban: "bg-slate-100 text-slate-700",
  desert: "bg-yellow-50 text-yellow-800",
  wine: "bg-rose-100 text-rose-700",
};

function tagStyle(tag: string) {
  return TAG_COLORS[tag] ?? "bg-charcoal/10 text-charcoal/70";
}

// ─── City Card (memoized to prevent unnecessary re-renders) ───────────────────

const CityCard = memo(function CityCard({
  city,
  selected,
  onToggle,
}: {
  city: City;
  selected: boolean;
  onToggle: (city: City) => void;
}) {
  const imgSrc = city.images?.[0] || banner;

  return (
    <button
      id={`city-card-${city.id}`}
      onClick={() => onToggle(city)}
      className={`relative rounded-2xl overflow-hidden text-left border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal hover:-translate-y-1 active:scale-[0.98] ${
        selected
          ? "border-teal shadow-[0_0_0_4px_color-mix(in_oklab,var(--teal)_20%,transparent)]"
          : "border-border/60 hover:border-teal/40"
      }`}
      aria-pressed={selected}
    >
      {/* Image */}
      <div className="h-36 w-full overflow-hidden bg-muted">
        <img
          src={imgSrc}
          alt={`${city.name}, ${city.country}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Selected overlay */}
      {selected && (
        <div className="absolute inset-0 bg-teal/10 flex items-start justify-end p-2">
          <span className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
            ✓
          </span>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-card">
        <p className="font-semibold text-sm text-charcoal leading-tight line-clamp-1">
          {city.name}
        </p>
        <p className="text-xs text-charcoal/50 mt-0.5 flex items-center gap-1">
          <Globe size={10} />
          {city.country}
        </p>
        {city.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {city.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${tagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

function PlanTripPage() {
  const navigate = useNavigate();
  const { user, accessToken, isInitialized } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [citySearch, setCitySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce city search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(citySearch), 350);
    return () => clearTimeout(id);
  }, [citySearch]);

  // Fetch cities
  useEffect(() => {
    let active = true;
    setCitiesLoading(true);
    fetchCities(debouncedSearch, 9)
      .then((data) => { if (active) setCities(data); })
      .catch(() => { if (active) setCities([]); })
      .finally(() => { if (active) setCitiesLoading(false); });
    return () => { active = false; };
  }, [debouncedSearch]);

  const toggleCity = useCallback((city: City) => {
    setSelectedCities((prev) =>
      prev.find((c) => c.id === city.id)
        ? prev.filter((c) => c.id !== city.id)
        : [...prev, city]
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setError("Please log in to create a trip.");
      return;
    }
    if (!title.trim()) {
      setError("Please give your trip a title.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const trip = await createTrip(accessToken, {
        title: title.trim(),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        total_budget: budget ? parseFloat(budget) : undefined,
        currency,
      });
      navigate({
        to: "/itinerary/$tripId",
        params: { tripId: trip.id },
        search: {
          cities: selectedCities.map((c) => c.id).join(","),
        } as any,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect to login if not authenticated
  if (isInitialized && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-teal" size={28} />
          </div>
          <h2 className="text-xl font-display font-semibold text-charcoal">
            Sign in to plan a trip
          </h2>
          <p className="mt-2 text-sm text-charcoal/60">
            You need to be logged in to create and manage trips.
          </p>
          <div className="mt-5 flex gap-3 justify-center">
            <a
              href="/login"
              className="rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-charcoal"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="pt-20 pb-24">
        {/* ── Header ───────────────────────────────────── */}
        <section className="relative pt-10 pb-6 overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, color-mix(in oklab, var(--teal) 18%, transparent), transparent 70%)",
            }}
          />
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
                <Sparkles size={12} /> New Journey
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-display font-bold text-charcoal">
                Plan a new trip
              </h1>
              <p className="mt-2 text-charcoal/60 text-sm sm:text-base">
                Fill in the details below, then pick cities to visit — we'll
                build your itinerary on the next screen.
              </p>
            </div>
          </div>
        </section>

        {/* ── Form ─────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6">
          <form onSubmit={handleSubmit} noValidate>
            <div
              className="rounded-2xl border border-border/70 bg-card shadow-card overflow-hidden animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Card header */}
              <div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-card to-muted/30">
                <h2 className="font-display font-semibold text-charcoal text-base">
                  Trip Details
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Trip Title */}
                <div>
                  <label
                    htmlFor="trip-title"
                    className="block text-sm font-medium text-charcoal/80 mb-1.5"
                  >
                    Trip Name <span className="text-primary">*</span>
                  </label>
                  <input
                    id="trip-title"
                    type="text"
                    placeholder="e.g. Europe Summer 2025"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="start-date"
                      className="block text-sm font-medium text-charcoal/80 mb-1.5"
                    >
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-teal" />
                        Start Date
                      </span>
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className="block text-sm font-medium text-charcoal/80 mb-1.5"
                    >
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-teal" />
                        End Date
                      </span>
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-charcoal/80 mb-1.5"
                    >
                      <span className="flex items-center gap-1.5">
                        <DollarSign size={13} className="text-teal" />
                        Total Budget
                      </span>
                    </label>
                    <input
                      id="budget"
                      type="number"
                      placeholder="e.g. 3000"
                      value={budget}
                      min="0"
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-charcoal/80 mb-1.5"
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                    >
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                      <option value="GBP">GBP £</option>
                      <option value="INR">INR ₹</option>
                      <option value="JPY">JPY ¥</option>
                      <option value="AUD">AUD $</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── City Suggestions ─────────────────────────────────── */}
            <div
              className="mt-6 rounded-2xl border border-border/70 bg-card shadow-card overflow-hidden animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-card to-muted/30">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-semibold text-charcoal text-base">
                      Suggested Places to Visit
                    </h2>
                    <p className="text-xs text-charcoal/50 mt-0.5">
                      Select one or more cities to add to your itinerary
                    </p>
                  </div>
                  {selectedCities.length > 0 && (
                    <span className="bg-teal text-white text-xs font-bold rounded-full px-2.5 py-1 min-w-[1.8rem] text-center">
                      {selectedCities.length}
                    </span>
                  )}
                </div>

                {/* Search bar */}
                <label className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5">
                  <Search size={15} className="text-teal shrink-0" />
                  <input
                    id="city-search"
                    type="text"
                    placeholder="Search destinations…"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/35 outline-none"
                  />
                  {citySearch && (
                    <button
                      type="button"
                      onClick={() => setCitySearch("")}
                      className="text-charcoal/40 hover:text-charcoal/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
              </div>

              <div className="p-6">
                {/* Selected cities chips */}
                {selectedCities.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedCities.map((city) => (
                      <span
                        key={city.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 border border-teal/30 px-3 py-1 text-xs font-medium text-teal"
                      >
                        <MapPin size={10} />
                        {city.name}
                        <button
                          type="button"
                          onClick={() => toggleCity(city)}
                          className="text-teal/60 hover:text-teal ml-0.5"
                          aria-label={`Remove ${city.name}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Grid */}
                {citiesLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-border/60 bg-muted overflow-hidden animate-pulse"
                      >
                        <div className="h-36 bg-muted/80" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 w-3/4 bg-muted/80 rounded" />
                          <div className="h-2.5 w-1/2 bg-muted/60 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cities.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe size={32} className="text-charcoal/20 mx-auto mb-2" />
                    <p className="text-sm text-charcoal/40">
                      No destinations found for "{citySearch}"
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {cities.map((city) => (
                      <CityCard
                        key={city.id}
                        city={city}
                        selected={selectedCities.some((c) => c.id === city.id)}
                        onToggle={toggleCity}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Error ─────────────────────────────────────────────── */}
            {error && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <X size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* ── Submit ────────────────────────────────────────────── */}
            <div
              className="mt-6 flex items-center justify-between gap-4 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <p className="text-xs text-charcoal/40 hidden sm:block">
                {selectedCities.length > 0
                  ? `${selectedCities.length} city selected — you can add more on the next screen`
                  : "You can also add cities on the itinerary screen"}
              </p>
              <button
                id="plan-trip-submit"
                type="submit"
                disabled={submitting || !title.trim()}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-card disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Build Itinerary
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
