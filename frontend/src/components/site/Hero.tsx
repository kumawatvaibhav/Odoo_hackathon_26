import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import banner from "@/assets/hero-banner.jpg";
import lisbon from "@/assets/region-lisbon.jpg";
import marrakesh from "@/assets/region-marrakesh.jpg";
import reykjavik from "@/assets/region-reykjavik.jpg";
import hanoi from "@/assets/region-hanoi.jpg";
import kyoto from "@/assets/region-kyoto.jpg";
import { fetchPexelsPhotos } from "@/lib/pexels";

export function Hero() {
  const fallbackSlides = useMemo(
    () => [
      {
        src: banner,
        alt: "Sunset over a winding coastal road above the Mediterranean",
      },
      { src: lisbon, alt: "Lisbon hillside and river light" },
      { src: marrakesh, alt: "Marrakesh rooftops at dusk" },
      { src: reykjavik, alt: "Reykjavik shoreline in soft light" },
      { src: hanoi, alt: "Hanoi lantern streets" },
      { src: kyoto, alt: "Kyoto garden pathways" },
    ],
    []
  );
  const [slides, setSlides] = useState(fallbackSlides);

  const slideRefs = useRef<HTMLDivElement[]>([]);
  slideRefs.current = [];

  useEffect(() => {
    let active = true;

    const loadSlides = async () => {
      const [india, world] = await Promise.all([
        fetchPexelsPhotos("India travel landscape", 3),
        fetchPexelsPhotos("world travel landscape", 3),
      ]);
      const merged = [...india, ...world]
        .map((photo) => ({
          src: photo.src.large2x || photo.src.landscape,
          alt: photo.alt || "Travel landscape",
        }))
        .slice(0, 5);
      if (active && merged.length >= 5) {
        setSlides(merged);
      }
    };

    loadSlides();

    return () => {
      active = false;
    };
  }, [fallbackSlides]);

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
  }, [slides.length]);

  return (
    <section id="top" className="relative pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] shadow-elegant">
          <div className="relative w-full h-[64vh] min-h-[460px] max-h-[720px]">
            {slides.map((slide, index) => (
              <div
                key={`${slide.src}-${index}`}
                ref={(node) => {
                  if (node) {
                    slideRefs.current[index] = node;
                  }
                }}
                className="absolute inset-0"
                aria-hidden={index !== 0}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
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
                href="/signup"
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

