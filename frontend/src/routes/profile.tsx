import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Mail, Calendar, Edit3, LogOut, Compass, Plane,
  Briefcase, Globe, Clock,
} from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { TripCard, TripCardSkeleton, type TripData } from "@/components/profile/TripCard";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { useAuth, API_BASE } from "@/lib/auth-context";

// ── Helper: map API trip row → TripData for the card ───────────────
function mapTripRow(row: any): TripData {
  const startDate = row.start_date
    ? new Date(row.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;
  const endDate = row.end_date
    ? new Date(row.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const dates = startDate && endDate ? `${startDate} – ${endDate}` : "Dates TBD";

  const destination = row.destination_name
    ? `${row.destination_name}, ${row.destination_country || ""}`
    : row.title;

  return {
    id: row.id,
    destination,
    dates,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #e8f4fd 100%)",
    imageUrl: row.cover_image_url || row.destination_image || undefined,
    badge: row.total_budget ? `$${parseFloat(row.total_budget).toLocaleString()}` : undefined,
    summary: row.description || undefined,
    rating: row.trip_status === "completed" ? 5 : undefined,
  };
}

// ── Route ──────────────────────────────────────────────────────────
export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Traveloop" },
      { name: "description", content: "View and manage your Traveloop profile, trips, and travel history." },
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
  component: ProfilePage,
});

// ── Page ───────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, accessToken, signout, isInitialized } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [preplannedTrips, setPreplannedTrips] = useState<TripData[]>([]);
  const [completedTrips, setCompletedTrips] = useState<TripData[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  // Fetch trips from API
  const fetchTrips = useCallback(async () => {
    if (!accessToken) {
      setTripsLoading(false);
      return;
    }
    setTripsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trips/my`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPreplannedTrips((json.data.preplanned || []).map(mapTripRow));
          setCompletedTrips((json.data.completed || []).map(mapTripRow));
        }
      }
    } catch {
      // Silently fail — empty state will show
    }
    setTripsLoading(false);
  }, [accessToken]);

  useEffect(() => {
    if (isInitialized && user) {
      fetchTrips();
    } else if (isInitialized) {
      setTripsLoading(false);
    }
  }, [isInitialized, user, fetchTrips]);

  // Not initialized yet — show skeleton
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-28 pb-20 max-w-5xl mx-auto px-6">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-sm space-y-5"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-muted grid place-items-center">
              <Compass size={32} className="text-charcoal/30" />
            </div>
            <h2 className="font-display font-bold text-2xl text-charcoal">Sign in to view your profile</h2>
            <p className="text-sm text-charcoal/60 leading-relaxed">
              Access your trips, travel history, and account settings by signing in.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Link to="/login">
                <motion.span
                  className="inline-flex items-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-charcoal shadow-card cursor-pointer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign in
                </motion.span>
              </Link>
              <Link to="/signup">
                <motion.span
                  className="inline-flex items-center rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card cursor-pointer"
                  whileHover={{ y: -2, boxShadow: "0 12px 28px -12px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create account
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
  const location = [user.city, user.country].filter(Boolean).join(", ");
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const totalTrips = preplannedTrips.length + completedTrips.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* ── Profile Banner ── */}
      <div className="relative pt-16">
        <div className="h-48 md:h-56 bg-gradient-to-br from-teal/20 via-teal/5 to-coral/10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><circle cx='30' cy='30' r='1' fill='%231a1a2e'/></svg>\")",
            }}
          />
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-card border border-border/70 shadow-elegant p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt={`${user.first_name}'s photo`}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-card shadow-card"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-2xl md:text-3xl font-bold border-4 border-card shadow-card">
                  {initials}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-teal border-[3px] border-card" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-2xl md:text-3xl text-charcoal tracking-tight">
                    {user.first_name} {user.last_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-charcoal/60">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={14} className="text-teal" /> {user.email}
                    </span>
                    {location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-coral" /> {location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} className="text-gold" /> Joined {memberSince}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-charcoal/70 max-w-lg leading-relaxed">
                    Travel enthusiast exploring the world one loop at a time. Always planning the next adventure.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-card cursor-pointer"
                    whileHover={{ y: -2, boxShadow: "0 12px 28px -12px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit3 size={15} /> Edit Profile
                  </motion.button>
                  <motion.button
                    onClick={signout}
                    className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 text-destructive px-4 py-2.5 text-sm font-medium cursor-pointer"
                    whileHover={{ y: -2, backgroundColor: "rgba(220,38,38,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={15} /> Sign out
                  </motion.button>
                </div>
              </div>

              {/* Auth status badge */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal/10 text-teal px-3 py-1.5 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                Signed in
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-border/60">
            {[
              { icon: Plane, label: "Upcoming", value: String(preplannedTrips.length), color: "text-teal" },
              { icon: Globe, label: "Completed", value: String(completedTrips.length), color: "text-coral" },
              { icon: Briefcase, label: "Total Trips", value: String(totalTrips), color: "text-gold" },
              { icon: Clock, label: "Member Since", value: new Date(user.created_at).getFullYear().toString(), color: "text-charcoal/70" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="rounded-xl bg-muted/40 border border-border/50 p-4 text-center"
                whileHover={{ y: -2, borderColor: "color-mix(in oklab, var(--teal) 30%, transparent)" }}
                transition={{ duration: 0.2 }}
              >
                <stat.icon size={20} className={`mx-auto ${stat.color}`} />
                <p className="mt-2 font-display font-bold text-xl text-charcoal">{stat.value}</p>
                <p className="text-xs text-charcoal/50 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Preplanned Trips ── */}
        <motion.section
          className="mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">Coming Up</span>
              <h2 className="mt-1 font-display font-bold text-2xl text-charcoal tracking-tight">Preplanned Trips</h2>
            </div>
            {preplannedTrips.length > 0 && (
              <motion.button
                className="text-sm text-teal font-medium cursor-pointer"
                whileHover={{ x: 4 }}
              >
                View all →
              </motion.button>
            )}
          </div>

          {tripsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </div>
          ) : preplannedTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {preplannedTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} variant="upcoming" index={i} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Plane} title="No upcoming trips" description="Start planning your next adventure!" ctaLabel="Plan a trip" />
          )}
        </motion.section>

        {/* ── Previous Trips ── */}
        <motion.section
          className="mt-14 pb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">Memories</span>
              <h2 className="mt-1 font-display font-bold text-2xl text-charcoal tracking-tight">Previous Trips</h2>
            </div>
            {completedTrips.length > 0 && (
              <motion.button
                className="text-sm text-coral font-medium cursor-pointer"
                whileHover={{ x: 4 }}
              >
                View all →
              </motion.button>
            )}
          </div>

          {tripsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </div>
          ) : completedTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} variant="completed" index={i} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Globe} title="No completed trips yet" description="Your travel history will appear here." />
          )}
        </motion.section>
      </div>

      <Footer />

      {/* Edit Modal */}
      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} user={user} />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description, ctaLabel }: {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 py-16 text-center"
    >
      <div className="mx-auto w-14 h-14 rounded-full bg-muted grid place-items-center mb-4">
        <Icon size={24} className="text-charcoal/30" />
      </div>
      <h3 className="font-display font-semibold text-charcoal">{title}</h3>
      <p className="mt-1 text-sm text-charcoal/50">{description}</p>
      {ctaLabel && (
        <Link to="/">
          <motion.span
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card cursor-pointer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {ctaLabel}
          </motion.span>
        </Link>
      )}
    </motion.div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="rounded-2xl bg-card border border-border/70 p-8">
        <div className="flex gap-6">
          <div className="w-28 h-28 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-6 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-80" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <TripCardSkeleton />
        <TripCardSkeleton />
        <TripCardSkeleton />
      </div>
    </div>
  );
}
