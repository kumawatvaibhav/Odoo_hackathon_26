import amalfi from "@/assets/trip-amalfi.jpg";
import patagonia from "@/assets/trip-patagonia.jpg";
import morocco from "@/assets/trip-morocco.jpg";
import { Calendar, Users, ArrowUpRight } from "lucide-react";

const trips = [
  {
    title: "Amalfi & the Tyrrhenian Loop",
    img: amalfi,
    dates: "Jun 12 – Jun 24, 2025",
    stops: 6,
    crew: 2,
    spend: "$3,420",
    note: "Slow mornings in Praiano, lemon groves, a ferry to Capri.",
  },
  {
    title: "Patagonia, end to end",
    img: patagonia,
    dates: "Nov 4 – Nov 22, 2024",
    stops: 8,
    crew: 4,
    spend: "$5,180",
    note: "Glaciers, refugios, and one very long bus to Torres.",
  },
  {
    title: "A week of rooftops in Marrakesh",
    img: morocco,
    dates: "Mar 1 – Mar 8, 2024",
    stops: 3,
    crew: 2,
    spend: "$1,690",
    note: "Riads, mint tea on terraces, day trip to the Atlas.",
  },
];

export function Trips() {
  return (
    <section id="trips" className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
              Previous Trips
            </span>
            <h2 className="mt-2 font-display font-bold text-charcoal text-2xl md:text-4xl tracking-tight">
              Loops, lived in.
            </h2>
            <p className="mt-2 text-charcoal/65 max-w-xl text-sm md:text-base">
              A few of ours, kept open in the journal. Every itinerary you build
              becomes a quiet record you can return to.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {trips.map((t, i) => (
            <article
              key={t.title}
              className="group relative rounded-3xl overflow-hidden bg-card shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={t.img}
                  alt={t.title}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/30 to-transparent" />

                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-cream/90 backdrop-blur-md text-charcoal px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {t.stops} stops · {t.spend}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                  <h3 className="font-display font-semibold text-xl md:text-2xl leading-snug">
                    {t.title}
                  </h3>
                  <p className="mt-2 font-serif italic text-cream/75 text-sm leading-relaxed">
                    “{t.note}”
                  </p>

                  <div className="mt-5 flex items-center justify-between text-xs text-cream/70 border-t border-cream/15 pt-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} /> {t.dates}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} /> {t.crew}
                    </span>
                  </div>
                </div>

                <span className="absolute top-4 right-4 grid place-items-center w-9 h-9 rounded-full bg-cream/90 text-charcoal opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
