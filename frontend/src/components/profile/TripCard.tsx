import { motion } from "framer-motion";
import { MapPin, Calendar, Star, Eye, DollarSign } from "lucide-react";

export interface TripData {
  id: string;
  destination: string;
  dates: string;
  gradient: string;
  imageUrl?: string;
  badge?: string;
  summary?: string;
  rating?: number;
}

interface TripCardProps {
  trip: TripData;
  variant: "upcoming" | "completed";
  index?: number;
}

export function TripCard({ trip, variant, index = 0 }: TripCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-border/70 bg-card shadow-card"
        whileHover={{
          y: -6,
          boxShadow: "0 20px 40px -16px color-mix(in oklab, var(--teal) 25%, transparent)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Gradient / Image area */}
        <div 
          className="relative h-44 overflow-hidden bg-cover bg-center" 
          style={{ 
            background: trip.imageUrl ? `url('${trip.imageUrl}') center/cover no-repeat` : trip.gradient 
          }}
        >
          {trip.imageUrl && (
            <div className="absolute inset-0 bg-charcoal/20" />
          )}
          {!trip.imageUrl && (
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><circle cx='40' cy='40' r='1.5' fill='white'/></svg>\")",
              }}
            />
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-charcoal/40 backdrop-blur-md px-2.5 py-1 text-white text-xs font-medium">
            <MapPin size={12} />
            {trip.destination.split(",")[1]?.trim() || trip.destination}
          </div>
          {trip.badge && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-charcoal/40 backdrop-blur-md px-2.5 py-1 text-white text-xs font-semibold">
              {variant === "upcoming" && <DollarSign size={11} />}
              {trip.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-display font-semibold text-charcoal text-sm">{trip.destination}</h4>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-charcoal/55">
            <Calendar size={12} />
            {trip.dates}
          </div>
          {trip.summary && (
            <p className="mt-2 text-xs text-charcoal/60 line-clamp-2 leading-relaxed">{trip.summary}</p>
          )}
          {trip.rating != null && (
            <div className="flex items-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < trip.rating! ? "text-gold fill-gold" : "text-charcoal/20"}
                />
              ))}
            </div>
          )}
          <motion.button
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-primary text-primary-foreground py-2 text-xs font-semibold shadow-card cursor-pointer"
            whileHover={{ y: -1, boxShadow: "0 8px 20px -10px color-mix(in oklab, var(--primary) 35%, transparent)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye size={13} /> View
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/70 bg-card animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded-xl w-full mt-3" />
      </div>
    </div>
  );
}
