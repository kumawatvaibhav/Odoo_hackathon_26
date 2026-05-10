import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Calendar, DollarSign, MapPin, Trash2, ArrowLeft, Wallet, TrendingDown, ChevronRight, List, X } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth-context";
import { fetchTrip, addTripStop, updateTripStop, deleteTripStop, fetchActivities, addActivity, deleteActivityApi } from "@/lib/trips-api";
import type { Trip, TripStop, Activity } from "@/lib/trips-api";

export const Route = createFileRoute("/itinerary/$tripId")({
  head: () => ({
    meta: [
      { title: "Traveloop — Build Itinerary" },
    ],
  }),
  component: ItineraryPage,
});

// Currency symbol map
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", AUD: "A$",
  MAD: "MAD", THB: "฿", IDR: "Rp", ZAR: "R", AED: "AED",
};

function getCurrencySymbol(code: string) {
  return CURRENCY_SYMBOLS[code] || code;
}

function formatBudget(amount: number, currency: string) {
  return `${getCurrencySymbol(currency)} ${amount.toLocaleString()}`;
}

function ItineraryPage() {
  const { tripId } = Route.useParams();

  const navigate = useNavigate();
  const { accessToken, isInitialized } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<TripStop[]>([]);
  const [sectionBudgets, setSectionBudgets] = useState<Record<string, number>>({});
  const [activitiesByStop, setActivitiesByStop] = useState<Record<string, Activity[]>>({});
  const [activityInputs, setActivityInputs] = useState<Record<string, { title: string; expense: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timers for notes updates
  const [noteTimers, setNoteTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const [budgetTimers, setBudgetTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Computed budget values
  const totalBudget = trip?.total_budget ? Number(trip.total_budget) : 0;
  const currency = trip?.currency || "USD";

  const spentBudget = useMemo(() => {
    return Object.values(sectionBudgets).reduce((sum, val) => sum + (val || 0), 0);
  }, [sectionBudgets]);

  const remainingBudget = totalBudget - spentBudget;
  const budgetPercentUsed = totalBudget > 0 ? Math.min((spentBudget / totalBudget) * 100, 100) : 0;

  // Initial fetch
  useEffect(() => {
    let active = true;
    if (!accessToken) {
      if (isInitialized) setLoading(false);
      return;
    }

    const loadTrip = async () => {
      try {
        const data = await fetchTrip(accessToken, tripId);
        if (!active) return;
        setTrip(data);
        setStops(data.stops || []);
        const budgets: Record<string, number> = {};
        (data.stops || []).forEach((stop) => {
          if (typeof stop.budget === "number") budgets[stop.id] = stop.budget;
        });
        setSectionBudgets(budgets);
      } catch (err: any) {
        if (!active) return;
        setError(err.message || "Failed to load trip.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTrip();
    return () => { active = false; };
  }, [accessToken, tripId, isInitialized]);

  useEffect(() => {
    let active = true;
    if (!accessToken || stops.length === 0) return;

    const loadActivities = async () => {
      try {
        const results = await Promise.all(
          stops.map(async (stop) => ({
            stopId: stop.id,
            activities: await fetchActivities(accessToken, tripId, stop.id),
          }))
        );
        if (!active) return;
        const next: Record<string, Activity[]> = {};
        results.forEach((item) => {
          next[item.stopId] = item.activities;
        });
        setActivitiesByStop(next);
      } catch (err: any) {
        if (!active) return;
        setError(err.message || "Failed to load activities.");
      }
    };

    loadActivities();
    return () => { active = false; };
  }, [accessToken, stops, tripId]);

  // Handle adding a section
  const handleAddSection = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch("http://localhost:3000/api/trips/cities?limit=1");
      const json = await res.json();
      const city = json.data?.cities?.[0];

      if (!city) throw new Error("No city available to add");

      const newStop = await addTripStop(accessToken, tripId, {
        city_id: city.id,
        notes: "",
      });

      // Normalize: backend returns { ...stop, city: { id, name, country } }
      // but getTripById returns { ...stop, city_name, country } at top level.
      const normalized: TripStop = {
        ...newStop,
        city_name: (newStop as any).city?.name || city.name || "",
        country: (newStop as any).city?.country || city.country || "",
        images: (newStop as any).city?.images || city.images || [],
        tags: (newStop as any).city?.tags || city.tags || [],
      };
      setStops(prev => [...prev, normalized]);
      if (typeof normalized.budget === "number") {
        setSectionBudgets(prev => ({ ...prev, [normalized.id]: normalized.budget as number }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to add section.");
    }
  };

  // Debounced notes update - only sends API call after user stops typing
  const handleNotesChange = useCallback((stopId: string, value: string) => {
    // Immediately update local state for responsive UI
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, notes: value } : s));

    // Clear previous timer
    setNoteTimers(prev => {
      if (prev[stopId]) clearTimeout(prev[stopId]);
      const timer = setTimeout(async () => {
        if (!accessToken) return;
        try {
          await updateTripStop(accessToken, tripId, stopId, { notes: value });
        } catch { /* silent fail for debounced update */ }
      }, 800);
      return { ...prev, [stopId]: timer };
    });
  }, [accessToken, tripId]);

  // Date updates - immediate API call
  const handleDateChange = useCallback(async (stopId: string, field: "arrival_date" | "departure_date", value: string) => {
    // Update local state immediately
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, [field]: value } : s));

    if (!accessToken) return;
    try {
      await updateTripStop(accessToken, tripId, stopId, { [field]: value || undefined });
    } catch (err: any) {
      setError(err.message || "Failed to update date.");
    }
  }, [accessToken, tripId]);

  // Section budget change (local only - not persisted to DB)
  const handleSectionBudgetChange = useCallback((stopId: string, value: string) => {
    const num = value === "" ? 0 : parseFloat(value) || 0;
    setSectionBudgets(prev => ({ ...prev, [stopId]: num }));

    setBudgetTimers(prev => {
      if (prev[stopId]) clearTimeout(prev[stopId]);
      const timer = setTimeout(async () => {
        if (!accessToken) return;
        try {
          await updateTripStop(accessToken, tripId, stopId, { budget: num });
        } catch { /* silent fail for debounced update */ }
      }, 800);
      return { ...prev, [stopId]: timer };
    });
  }, [accessToken, tripId]);

  const handleDeleteSection = async (stopId: string) => {
    if (!accessToken) return;
    try {
      await deleteTripStop(accessToken, tripId, stopId);
      setStops(prev => prev.filter(s => s.id !== stopId));
      setSectionBudgets(prev => {
        const next = { ...prev };
        delete next[stopId];
        return next;
      });
      setActivitiesByStop(prev => {
        const next = { ...prev };
        delete next[stopId];
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete section.");
    }
  };

  const handleActivityInputChange = useCallback((key: string, field: "title" | "expense", value: string) => {
    setActivityInputs(prev => ({
      ...prev,
      [key]: { title: prev[key]?.title || "", expense: prev[key]?.expense || "", [field]: value },
    }));
  }, []);

  const handleAddActivity = useCallback(async (stopId: string, dayNumber: number) => {
    if (!accessToken) return;
    const key = `${stopId}-${dayNumber}`;
    const draft = activityInputs[key];
    const title = (draft?.title || "").trim();
    if (!title) {
      setError("Activity title is required.");
      return;
    }

    try {
      const expense = draft?.expense ? parseFloat(draft.expense) || 0 : 0;
      const activity = await addActivity(accessToken, tripId, stopId, {
        day_number: dayNumber,
        title,
        expense,
      });
      setActivitiesByStop(prev => ({
        ...prev,
        [stopId]: [...(prev[stopId] || []), activity],
      }));
      setActivityInputs(prev => ({ ...prev, [key]: { title: "", expense: "" } }));
    } catch (err: any) {
      setError(err.message || "Failed to add activity.");
    }
  }, [accessToken, activityInputs, tripId]);

  const handleDeleteActivity = useCallback(async (stopId: string, activityId: string) => {
    if (!accessToken) return;
    try {
      await deleteActivityApi(accessToken, tripId, stopId, activityId);
      setActivitiesByStop(prev => ({
        ...prev,
        [stopId]: (prev[stopId] || []).filter((activity) => activity.id !== activityId),
      }));
    } catch (err: any) {
      setError(err.message || "Failed to delete activity.");
    }
  }, [accessToken, tripId]);

  const getStopDayCount = useCallback((stop: TripStop) => {
    if (!stop.arrival_date || !stop.departure_date) return 1;
    const start = new Date(stop.arrival_date);
    const end = new Date(stop.departure_date);
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diff, 1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center">
          <span className="h-8 w-8 rounded-full border-4 border-teal/40 border-t-teal animate-spin" />
        </main>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-destructive mb-4">{error || "Trip not found."}</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="text-teal hover:underline"
          >
            Go back home
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate({ to: "/plan-trip" })}
              className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Planning
            </button>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">
              {trip.title}
            </h1>
            <p className="mt-2 text-charcoal/60">
              Build your itinerary sections below. Add dates, budgets, and notes for each stop.
            </p>

            {/* Trip dates display */}
            {(trip.start_date || trip.end_date) && (
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-charcoal/70 bg-card border border-border/60 rounded-xl px-4 py-2">
                <Calendar size={14} className="text-teal" />
                {trip.start_date && new Date(trip.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                {trip.start_date && trip.end_date && <span className="text-charcoal/40">→</span>}
                {trip.end_date && new Date(trip.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            )}
          </div>

          {/* ── Budget Tracker ─────────────────────────────── */}
          {totalBudget > 0 && (
            <div className="mb-8 rounded-2xl border border-border/70 bg-card p-5 shadow-sm animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-teal" />
                  <h3 className="font-display font-semibold text-charcoal text-sm">
                    Budget Tracker
                  </h3>
                </div>
                <span className="text-xs text-charcoal/50 uppercase tracking-wider">
                  {currency}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 rounded-full bg-muted overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    budgetPercentUsed > 90
                      ? "bg-gradient-to-r from-red-400 to-red-500"
                      : budgetPercentUsed > 60
                        ? "bg-gradient-to-r from-amber-400 to-orange-400"
                        : "bg-gradient-to-r from-teal to-emerald-400"
                  }`}
                  style={{ width: `${budgetPercentUsed}%` }}
                />
              </div>

              {/* Budget breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-1">Total Budget</p>
                  <p className="text-lg font-display font-bold text-charcoal">
                    {formatBudget(totalBudget, currency)}
                  </p>
                </div>
                <div className="text-center border-x border-border/60">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-1 flex items-center justify-center gap-1">
                    <TrendingDown size={10} /> Allocated
                  </p>
                  <p className={`text-lg font-display font-bold ${spentBudget > 0 ? "text-amber-600" : "text-charcoal/30"}`}>
                    {formatBudget(spentBudget, currency)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-1">Remaining</p>
                  <p className={`text-lg font-display font-bold ${
                    remainingBudget < 0 ? "text-red-500" : "text-teal"
                  }`}>
                    {formatBudget(remainingBudget, currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Error banner ──────────────────────────────── */}
          {error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
              <button onClick={() => setError(null)} className="ml-2 underline text-xs">dismiss</button>
            </div>
          )}

          {/* ── Sections ──────────────────────────────────── */}
          <div className="space-y-6">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-display font-semibold text-charcoal flex items-center gap-2">
                      Section {index + 1}:
                      {stop.city_name && (
                        <span className="text-teal">{stop.city_name}</span>
                      )}
                    </h3>
                    {stop.country && (
                      <p className="text-sm text-charcoal/60 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {stop.country}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSection(stop.id)}
                    className="text-destructive/70 hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors"
                    aria-label="Delete section"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-charcoal/80 mb-1">
                    Information
                  </label>
                  <textarea
                    value={stop.notes || ""}
                    onChange={(e) => handleNotesChange(stop.id, e.target.value)}
                    placeholder="All the necessary information about this section. This can be anything like travel section, hotel or any other activity."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all resize-none h-24"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date Range */}
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-2 flex items-center gap-1">
                      <Calendar size={10} className="text-teal" /> Date Range
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={stop.arrival_date ? String(stop.arrival_date).split("T")[0] : ""}
                        min={trip.start_date ? String(trip.start_date).split("T")[0] : undefined}
                        max={trip.end_date ? String(trip.end_date).split("T")[0] : undefined}
                        onChange={(e) => handleDateChange(stop.id, "arrival_date", e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 min-w-0 text-charcoal"
                      />
                      <span className="text-charcoal/30 text-xs px-1">to</span>
                      <input
                        type="date"
                        value={stop.departure_date ? String(stop.departure_date).split("T")[0] : ""}
                        min={stop.arrival_date ? String(stop.arrival_date).split("T")[0] : (trip.start_date ? String(trip.start_date).split("T")[0] : undefined)}
                        max={trip.end_date ? String(trip.end_date).split("T")[0] : undefined}
                        onChange={(e) => handleDateChange(stop.id, "departure_date", e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 min-w-0 text-charcoal"
                      />
                    </div>
                  </div>

                  {/* Section Budget */}
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-2 flex items-center gap-1">
                      <DollarSign size={10} className="text-teal" /> Budget of this section
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-teal">
                        {getCurrencySymbol(currency)}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={sectionBudgets[stop.id] ?? ""}
                        onChange={(e) => handleSectionBudgetChange(stop.id, e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 min-w-0 text-charcoal placeholder:text-charcoal/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {stops.length === 0 && (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border/80 bg-card/50">
                <MapPin size={28} className="text-charcoal/20 mx-auto mb-2" />
                <p className="text-charcoal/60">No sections added yet.</p>
                <p className="text-xs text-charcoal/40 mt-1">Click below to add your first itinerary section.</p>
              </div>
            )}

            {/* Add Section Button */}
            <button
              onClick={handleAddSection}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/70 bg-card py-4 font-medium text-charcoal/80 hover:text-charcoal hover:border-teal/40 hover:bg-teal/5 active:scale-[0.99] transition-all shadow-sm"
            >
              <Plus size={18} className="text-teal" />
              Add another Section
            </button>

            {/* View All Trips */}
            {stops.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between gap-4">
                <p className="text-xs text-charcoal/50">
                  {stops.length} {stops.length === 1 ? "section" : "sections"} added — your trip is auto-saved.
                </p>
                <button
                  onClick={() => navigate({ to: "/my-trips" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-charcoal text-cream px-5 py-2.5 text-sm font-semibold shadow-card hover:bg-charcoal/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  View All My Trips
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ── Itinerary View ─────────────────────────────── */}
          {stops.length > 0 && (
            <div className="mt-12 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <List size={18} className="text-teal" />
                <h2 className="text-lg font-display font-semibold text-charcoal">
                  Itinerary for selected place
                </h2>
              </div>

              {stops.map((stop) => {
                const activities = activitiesByStop[stop.id] || [];
                const dayCount = getStopDayCount(stop);
                const maxActivityDay = activities.reduce((max, item) => Math.max(max, item.day_number), 1);
                const maxDay = Math.max(dayCount, maxActivityDay);
                const dayNumbers = Array.from({ length: maxDay }, (_, idx) => idx + 1);

                const stopExpenseTotal = activities.reduce((sum, item) => sum + (Number(item.expense) || 0), 0);

                return (
                  <div key={stop.id} className="mb-8 last:mb-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-display font-semibold text-charcoal">
                          {stop.city_name || "Itinerary Section"}
                        </h3>
                        {stop.country && (
                          <p className="text-xs text-charcoal/60 flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {stop.country}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-charcoal/60">
                        Total expense: <span className="font-semibold text-charcoal">{formatBudget(stopExpenseTotal, currency)}</span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {dayNumbers.map((dayNumber) => {
                        const dayKey = `${stop.id}-${dayNumber}`;
                        const dayActivities = activities.filter((item) => item.day_number === dayNumber);
                        const dayTotal = dayActivities.reduce((sum, item) => sum + (Number(item.expense) || 0), 0);

                        return (
                          <div key={dayKey} className="rounded-xl border border-border/60 bg-background p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-charcoal">Day {dayNumber}</span>
                              <span className="text-xs text-charcoal/60">Day total: {formatBudget(dayTotal, currency)}</span>
                            </div>

                            <div className="grid grid-cols-[1fr_140px] gap-3 text-xs uppercase tracking-wider text-charcoal/50 mb-2">
                              <div>Physical Activity</div>
                              <div className="text-right">Expense</div>
                            </div>

                            <div className="space-y-2">
                              {dayActivities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="grid grid-cols-[1fr_140px] items-center gap-3 rounded-lg border border-border/40 bg-card px-3 py-2"
                                >
                                  <div className="text-sm text-charcoal flex items-center justify-between gap-2">
                                    <span>{activity.title || "Untitled activity"}</span>
                                    <button
                                      onClick={() => handleDeleteActivity(stop.id, activity.id)}
                                      className="text-charcoal/40 hover:text-destructive transition-colors"
                                      aria-label="Delete activity"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                  <div className="text-right text-sm font-medium text-charcoal">
                                    {formatBudget(Number(activity.expense) || 0, currency)}
                                  </div>
                                </div>
                              ))}

                              {dayActivities.length === 0 && (
                                <p className="text-sm text-charcoal/45">No activities added yet.</p>
                              )}

                              <div className="grid grid-cols-[1fr_140px] gap-3 items-center">
                                <input
                                  type="text"
                                  value={activityInputs[dayKey]?.title || ""}
                                  onChange={(e) => handleActivityInputChange(dayKey, "title", e.target.value)}
                                  placeholder="Add activity"
                                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/35 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={activityInputs[dayKey]?.expense || ""}
                                    onChange={(e) => handleActivityInputChange(dayKey, "expense", e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/35 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 text-right"
                                  />
                                  <button
                                    onClick={() => handleAddActivity(stop.id, dayNumber)}
                                    className="rounded-lg bg-teal text-cream px-3 py-2 text-xs font-semibold hover:bg-teal/90 transition-colors"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
