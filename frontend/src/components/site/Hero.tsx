import { useEffect, useMemo, useRef } from "react";
import { Search, ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";

export function Hero() {
  const slides = useMemo(
    () => [
      { name: "Himalayan Lake", art: <HimalayanLake /> },
      { name: "Jaipur Courtyard", art: <JaipurCourtyard /> },
      { name: "Kerala Backwaters", art: <KeralaBackwaters /> },
      { name: "Santorini Cliffs", art: <SantoriniCliffs /> },
      { name: "Kyoto Garden", art: <KyotoGarden /> },
    ],
    []
  );

  const slideRefs = useRef<HTMLDivElement[]>([]);
  slideRefs.current = [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const targets = slideRefs.current;
      gsap.set(targets, { autoAlpha: 0, scale: 1.04 });
      if (targets[0]) {
        gsap.set(targets[0], { autoAlpha: 1, scale: 1 });
      }

      const tl = gsap.timeline({ repeat: -1 });
      targets.forEach((target, index) => {
        const start = index * 4.2;
        tl.to(
          target,
          { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" },
          start
        ).to(
          target,
          { autoAlpha: 0, scale: 1.04, duration: 1.2, ease: "power2.in" },
          start + 3.0
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="top" className="relative pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] shadow-elegant">
          <div className="relative w-full h-[64vh] min-h-[460px] max-h-[720px]">
            {slides.map((slide, index) => (
              <div
                key={slide.name}
                ref={(node) => {
                  if (node) {
                    slideRefs.current[index] = node;
                  }
                }}
                className="absolute inset-0"
                aria-hidden={index !== 0}
              >
                <div className="absolute inset-0" aria-hidden="true">
                  {slide.art}
                </div>
                <span className="sr-only">{slide.name}</span>
              </div>
            ))}
          </div>
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

          <motion.div
            className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            <motion.span
              className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 backdrop-blur-md text-cream/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] border border-white/15"
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <MapPin size={13} className="text-teal" /> Issue n°14 · Coastal Loops
            </motion.span>

            <motion.h1
              className="mt-5 max-w-3xl font-display font-bold text-cream text-balance text-4xl sm:text-5xl md:text-6xl"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              Plan the long way{" "}
              <span className="font-serif italic font-medium text-gold">home</span>.
            </motion.h1>

            <motion.p
              className="mt-4 max-w-xl text-cream/80 text-base sm:text-lg"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              Traveloop is a quiet workspace for people who design trips on purpose —
              multi-city loops with smart budgets, shared notes, and rooms for
              serendipity.
            </motion.p>

            <motion.div
              className="mt-7 flex flex-wrap gap-3"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <motion.a
                href="#signup"
                className="inline-flex items-center gap-2 rounded-xl bg-cream text-charcoal px-6 py-3.5 font-semibold shadow-card"
                whileHover={{ y: -2, boxShadow: "0 12px 36px -16px color-mix(in oklab, var(--charcoal) 30%, transparent)" }}
                whileTap={{ scale: 0.98 }}
              >
                Start planning free <ArrowRight size={18} />
              </motion.a>
              <motion.a
                href="#regions"
                className="inline-flex items-center gap-2 rounded-xl border border-cream/30 text-cream px-6 py-3.5 font-semibold backdrop-blur-md"
                whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.98 }}
              >
                Browse regions
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* Search bar — floats over the bottom of the banner on desktop */}
        <SearchBar />
      </div>
    </section>
  );
}

function SearchBar() {
  return (
    <motion.div
      className="relative -mt-8 md:-mt-10 mx-2 sm:mx-6 rounded-2xl bg-card border border-border/70 shadow-elegant p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 z-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
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
          <motion.button
            key={label}
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs sm:text-sm font-medium text-charcoal/80"
            whileHover={{ y: -2, boxShadow: "0 10px 26px -14px color-mix(in oklab, var(--charcoal) 26%, transparent)" }}
            whileTap={{ scale: 0.98 }}
          >
            {label}
          </motion.button>
        ))}
        <motion.button
          className="rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-card"
          whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
          whileTap={{ scale: 0.98 }}
        >
          Search
        </motion.button>
      </div>
    </motion.div>
  );
}

function HimalayanLake() {
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfefff" />
          <stop offset="60%" stopColor="#f6f3ea" />
        </linearGradient>
        <linearGradient id="lakeH" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5aa6a5" />
          <stop offset="100%" stopColor="#2f6f6f" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#skyH)" />
      <path d="M0 520 L280 340 L520 520 L720 360 L980 520 L1200 300 L1600 520 V900 H0 Z" fill="#35404f" />
      <path d="M0 600 L280 420 L520 600 L720 440 L980 600 L1200 380 L1600 600 V900 H0 Z" fill="#1f2c36" />
      <rect y="600" width="1600" height="300" fill="url(#lakeH)" />
      <path d="M260 640 C420 620, 620 660, 820 640" stroke="#b8ede7" strokeWidth="10" opacity="0.55" fill="none" />
    </svg>
  );
}

function JaipurCourtyard() {
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyJ" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe4d6" />
          <stop offset="100%" stopColor="#fff7eb" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#skyJ)" />
      <rect y="440" width="1600" height="460" fill="#f4c8a5" />
      <rect x="140" y="260" width="1320" height="440" rx="36" fill="#e49e73" />
      <rect x="220" y="320" width="1160" height="320" rx="28" fill="#f2b892" />
      <g fill="#ce7c50">
        <rect x="300" y="360" width="220" height="220" rx="18" />
        <rect x="580" y="360" width="220" height="220" rx="18" />
        <rect x="860" y="360" width="220" height="220" rx="18" />
        <rect x="1140" y="360" width="220" height="220" rx="18" />
      </g>
      <circle cx="1320" cy="200" r="70" fill="#f9c77c" />
    </svg>
  );
}

function KeralaBackwaters() {
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyK" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe9f0" />
          <stop offset="100%" stopColor="#f4f1ea" />
        </linearGradient>
        <linearGradient id="waterK" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f9f9a" />
          <stop offset="100%" stopColor="#3f7b78" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#skyK)" />
      <rect y="520" width="1600" height="380" fill="url(#waterK)" />
      <path d="M0 520 C260 460, 520 560, 820 520 C1140 480, 1340 560, 1600 520 V900 H0 Z" fill="#2d5b57" opacity="0.35" />
      <g fill="#24463e">
        <rect x="140" y="360" width="160" height="140" rx="20" />
        <rect x="340" y="320" width="140" height="180" rx="20" />
        <rect x="520" y="360" width="160" height="140" rx="20" />
      </g>
      <path d="M880 640 C1040 620, 1220 660, 1360 640" stroke="#d2f2ee" strokeWidth="10" opacity="0.6" fill="none" />
    </svg>
  );
}

function SantoriniCliffs() {
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe1ff" />
          <stop offset="100%" stopColor="#fff7f1" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#skyS)" />
      <rect y="520" width="1600" height="380" fill="#2f5f7a" />
      <path d="M0 540 L220 460 L420 520 L620 420 L820 520 L1040 420 L1200 520 L1600 460 V900 H0 Z" fill="#f0f3f5" />
      <g fill="#ffffff">
        <rect x="260" y="420" width="160" height="120" rx="16" />
        <rect x="460" y="400" width="180" height="140" rx="16" />
        <rect x="700" y="420" width="170" height="120" rx="16" />
      </g>
      <circle cx="1050" cy="330" r="60" fill="#78a6d8" />
    </svg>
  );
}

function KyotoGarden() {
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6efe4" />
          <stop offset="100%" stopColor="#f6f1e5" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#skyG)" />
      <rect y="520" width="1600" height="380" fill="#aac8b5" />
      <path d="M0 560 C220 500, 520 620, 840 560 C1160 520, 1380 620, 1600 560 V900 H0 Z" fill="#6b8f7a" />
      <g fill="#3b4f43">
        <rect x="180" y="360" width="220" height="160" rx="24" />
        <rect x="470" y="330" width="200" height="190" rx="24" />
        <rect x="740" y="360" width="240" height="160" rx="24" />
      </g>
      <circle cx="1260" cy="240" r="70" fill="#f2b6b8" />
    </svg>
  );
}
