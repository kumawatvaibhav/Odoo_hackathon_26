import { Search, ArrowRight, MapPin } from "lucide-react";
import banner from "@/assets/hero-banner.jpg";

export function Hero() {
  return (
    <section id="top" className="relative pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] shadow-elegant">
          <img
            src={banner}
            alt="Sunset over a winding coastal road above the Mediterranean"
            width={1920}
            height={1080}
            className="w-full h-[64vh] min-h-[460px] max-h-[720px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-charcoal/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-transparent to-transparent" />

          {/* film grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
            }}
          />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 backdrop-blur-md text-cream/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] border border-white/15 animate-fade-up">
              <MapPin size={13} className="text-teal" /> Issue n°14 · Coastal Loops
            </span>

            <h1
              className="mt-5 max-w-3xl font-display font-bold text-cream text-balance text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              Plan the long way{" "}
              <span className="font-serif italic font-medium text-gold">home</span>.
            </h1>

            <p
              className="mt-4 max-w-xl text-cream/80 text-base sm:text-lg leading-relaxed animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              Traveloop is a quiet workspace for people who design trips on purpose —
              multi-city loops with smart budgets, shared notes, and rooms for
              serendipity.
            </p>

            <div
              className="mt-7 flex flex-wrap gap-3 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <a
                href="#signup"
                className="inline-flex items-center gap-2 rounded-xl bg-cream text-charcoal px-6 py-3.5 font-semibold shadow-card hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start planning free <ArrowRight size={18} />
              </a>
              <a
                href="#regions"
                className="inline-flex items-center gap-2 rounded-xl border border-cream/30 text-cream px-6 py-3.5 font-semibold backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                Browse regions
              </a>
            </div>
          </div>
        </div>

        {/* Search bar — floats over the bottom of the banner on desktop */}
        <SearchBar />
      </div>
    </section>
  );
}

function SearchBar() {
  return (
    <div className="relative -mt-8 md:-mt-10 mx-2 sm:mx-6 rounded-2xl bg-card border border-border/70 shadow-elegant p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 z-10">
      <label className="flex-1 flex items-center gap-3 px-3 md:px-4">
        <Search size={18} className="text-teal shrink-0" />
        <input
          type="text"
          placeholder="Where to next? Try Lisbon, Kyoto, the Atlas..."
          className="w-full bg-transparent outline-none text-charcoal placeholder:text-charcoal/40 text-sm md:text-base py-2"
        />
      </label>
      <div className="flex items-center gap-2 px-1">
        {["Group by", "Filter", "Sort by"].map((label) => (
          <button
            key={label}
            className="rounded-xl border border-border bg-background hover:bg-muted hover:border-teal/40 transition-colors px-3.5 py-2.5 text-xs sm:text-sm font-medium text-charcoal/80"
          >
            {label}
          </button>
        ))}
        <button className="rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-card hover:shadow-glow transition-all">
          Search
        </button>
      </div>
    </div>
  );
}
