import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ArrowLeft, Plus, Trash2, ArrowDown, DollarSign,
  MapPin, Calendar, Sparkles,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth-context";
import {
  fetchTrip, fetchActivities,
  addActivity, updateActivity, deleteActivityApi,
} from "@/lib/trips-api";
import type { Trip, TripStop, Activity } from "@/lib/trips-api";

export const Route = createFileRoute("/trip/$tripId/stop/$stopId")({
  head: () => ({
    meta: [{ title: "Traveloop — Day-by-Day Itinerary" }],
  }),
  component: StopItineraryPage,
});

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", AUD: "A$",
};
function sym(c: string) { return CURRENCY_SYMBOLS[c] || c; }

function StopItineraryPage() {
  const { tripId, stopId } = Route.useParams();
  const navigate = useNavigate();
  const { accessToken, isInitialized } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stop, setStop] = useState<TripStop | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timers
  const [timers, setTimers] = useState<Record<string, NodeJS.Timeout>>({});

  const currency = trip?.currency || "USD";

  // Load data
  useEffect(() => {
    let active = true;
    if (!accessToken) { if (isInitialized) setLoading(false); return; }

    const load = async () => {
      try {
        const [tripData, acts] = await Promise.all([
          fetchTrip(accessToken, tripId),
          fetchActivities(accessToken, tripId, stopId),
        ]);
        if (!active) return;
        setTrip(tripData);
        const s = tripData.stops?.find((st: TripStop) => st.id === stopId) || null;
        setStop(s);
        setActivities(acts);
      } catch (err: any) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [accessToken, tripId, stopId, isInitialized]);

  // Group activities by day
  const dayGroups = useMemo(() => {
    const map = new Map<number, Activity[]>();
    activities.forEach((a) => {
      const list = map.get(a.day_number) || [];
      list.push(a);
      map.set(a.day_number, list);
    });
    // Sort by day number
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [activities]);

  const maxDay = dayGroups.length > 0 ? dayGroups[dayGroups.length - 1][0] : 0;

  // Total expense
  const totalExpense = useMemo(() => {
    return activities.reduce((sum, a) => sum + Number(a.expense || 0), 0);
  }, [activities]);

  // Add activity
  const handleAddActivity = useCallback(async (dayNumber: number) => {
    if (!accessToken) return;
    try {
      const act = await addActivity(accessToken, tripId, stopId, {
        day_number: dayNumber,
        title: "",
        expense: 0,
      });
      setActivities(prev => [...prev, act]);
    } catch (err: any) {
      setError(err.message);
    }
  }, [accessToken, tripId, stopId]);

  // Add a new day
  const handleAddDay = useCallback(async () => {
    const newDay = maxDay + 1;
    await handleAddActivity(newDay);
  }, [maxDay, handleAddActivity]);

  // Update activity (debounced for title, immediate for expense)
  const handleUpdate = useCallback((actId: string, field: string, value: string | number) => {
    // Optimistic local update
    setActivities(prev => prev.map(a => a.id === actId ? { ...a, [field]: value } : a));

    // Debounce API call
    setTimers(prev => {
      const key = `${actId}-${field}`;
      if (prev[key]) clearTimeout(prev[key]);
      const timer = setTimeout(async () => {
        if (!accessToken) return;
        try {
          await updateActivity(accessToken, tripId, stopId, actId, { [field]: value });
        } catch { /* silent */ }
      }, 600);
      return { ...prev, [key]: timer };
    });
  }, [accessToken, tripId, stopId]);

  // Delete activity
  const handleDelete = useCallback(async (actId: string) => {
    if (!accessToken) return;
    setActivities(prev => prev.filter(a => a.id !== actId));
    try {
      await deleteActivityApi(accessToken, tripId, stopId, actId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [accessToken, tripId, stopId]);

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

  if (!trip || !stop) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-destructive mb-4">{error || "Stop not found."}</p>
          <button onClick={() => navigate({ to: "/" })} className="text-teal hover:underline">Go home</button>
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
          <div className="mb-8 animate-fade-up">
            <button
              onClick={() => navigate({ to: "/itinerary/$tripId", params: { tripId } })}
              className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Back to {trip.title}
            </button>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal mb-2">
                  <Sparkles size={12} /> Day-by-Day Itinerary
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-charcoal">
                  Itinerary for {stop.city_name || "Selected Place"}
                </h1>
                {stop.country && (
                  <p className="text-sm text-charcoal/60 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {stop.country}
                  </p>
                )}
                {(stop.arrival_date || stop.departure_date) && (
                  <p className="text-xs text-charcoal/50 flex items-center gap-1 mt-1.5">
                    <Calendar size={12} />
                    {stop.arrival_date && new Date(stop.arrival_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    {stop.arrival_date && stop.departure_date && " → "}
                    {stop.departure_date && new Date(stop.departure_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </p>
                )}
              </div>

              {/* Total expense badge */}
              <div className="rounded-xl border border-border/60 bg-card px-4 py-3 text-center shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-0.5">Total Expense</p>
                <p className={`text-xl font-display font-bold ${totalExpense > 0 ? "text-teal" : "text-charcoal/30"}`}>
                  {sym(currency)} {totalExpense.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
              <button onClick={() => setError(null)} className="ml-2 underline text-xs">dismiss</button>
            </div>
          )}

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_40px] gap-3 px-2 mb-2">
            <p className="text-[10px] uppercase tracking-wider text-charcoal/50 font-semibold">Physical Activity</p>
            <p className="text-[10px] uppercase tracking-wider text-charcoal/50 font-semibold text-right">Expense</p>
            <span />
          </div>

          {/* Day groups */}
          <div className="space-y-8">
            {dayGroups.map(([dayNum, dayActivities]) => (
              <div key={dayNum} className="animate-fade-up">
                {/* Day label */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg border-2 border-teal/30 bg-teal/5 text-xs font-bold text-teal tracking-wide">
                    Day {dayNum}
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-[10px] text-charcoal/40">
                    {sym(currency)} {dayActivities.reduce((s, a) => s + Number(a.expense || 0), 0).toLocaleString()}
                  </span>
                </div>

                {/* Activities */}
                <div className="space-y-0">
                  {dayActivities.map((act, i) => (
                    <div key={act.id}>
                      {/* Activity row */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_40px] gap-2 sm:gap-3 items-start">
                        {/* Title input */}
                        <input
                          type="text"
                          value={act.title}
                          onChange={(e) => handleUpdate(act.id, "title", e.target.value)}
                          placeholder="Activity description…"
                          className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                        />

                        {/* Expense */}
                        <div className="rounded-xl border border-border/60 bg-card px-3 py-3 flex items-center gap-1.5">
                          <span className="text-xs font-medium text-teal">{sym(currency)}</span>
                          <input
                            type="number"
                            min="0"
                            value={act.expense || ""}
                            onChange={(e) => handleUpdate(act.id, "expense", parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="bg-transparent text-sm outline-none w-full text-charcoal text-right placeholder:text-charcoal/30"
                          />
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(act.id)}
                          className="self-center text-destructive/50 hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors"
                          aria-label="Delete activity"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Arrow connector (between activities, not after the last one) */}
                      {i < dayActivities.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown size={16} className="text-charcoal/20" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add activity to this day */}
                  <button
                    onClick={() => handleAddActivity(dayNum)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 bg-card/50 py-2.5 text-xs font-medium text-charcoal/50 hover:text-teal hover:border-teal/30 hover:bg-teal/5 transition-all"
                  >
                    <Plus size={13} /> Add activity to Day {dayNum}
                  </button>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-card/50">
                <Calendar size={32} className="text-charcoal/15 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-charcoal text-lg">No activities yet</h3>
                <p className="text-sm text-charcoal/50 mt-1 mb-5">Start building your day-by-day itinerary.</p>
              </div>
            )}

            {/* Add new day button */}
            <button
              onClick={handleAddDay}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal/30 bg-teal/5 py-4 font-medium text-teal hover:bg-teal/10 hover:border-teal/50 active:scale-[0.99] transition-all"
            >
              <Plus size={18} />
              Add Day {maxDay + 1}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
