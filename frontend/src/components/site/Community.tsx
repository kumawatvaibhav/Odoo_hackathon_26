import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DESTINATIONS = ["Kyoto", "Lisbon", "Queenstown", "Hanoi", "Copenhagen", "Cartagena"];
const TARGET = 48290;

const TESTIMONIALS = [
  {
    quote:
      "Traveloop turned our month-long escape into a shared mission. We planned faster and spent less.",
    name: "Nina Ortega",
    role: "Adventure Creator",
  },
  {
    quote:
      "The budget view alone is worth it. I finally know where every dollar goes before I book.",
    name: "Marcus Lee",
    role: "Slow Traveler",
  },
  {
    quote:
      "Co-planning with my partner used to mean fifteen tabs. Now it's one elegant loop.",
    name: "Priya Anand",
    role: "Design Director",
  },
];

function useCounter(target: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          const start = performance.now();
          const dur = 2000;
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return { ref, val };
}

export function Community() {
  const { ref, val } = useCounter(TARGET);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <section id="stories" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div ref={ref}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
            Community Signal
          </span>
          <h2 className="mt-3 font-display font-bold text-charcoal text-3xl md:text-5xl tracking-tight">
            Trips planned this month.
          </h2>
          <p className="mt-6 font-display font-bold text-charcoal text-7xl md:text-8xl tracking-tighter tabular-nums bg-gradient-primary bg-clip-text text-transparent">
            {val.toLocaleString()}
          </p>
          <p className="mt-2 text-charcoal/60">active loops</p>

          <div className="mt-10">
            <p className="text-sm font-semibold text-charcoal mb-3">Popular destinations</p>
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-muted px-4 py-2 text-sm text-charcoal hover:bg-teal/10 hover:text-teal hover:scale-105 transition-all cursor-default"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
            Stories
          </span>
          <h2 className="mt-3 font-display font-bold text-charcoal text-3xl md:text-5xl tracking-tight">
            Travelers love the flow.
          </h2>

          <div className="mt-8 rounded-3xl bg-gradient-dark text-cream p-8 md:p-10 border border-teal/30 shadow-elegant relative overflow-hidden min-h-[280px]">
            <span className="font-serif text-7xl leading-none text-teal/60">“</span>
            <p
              key={idx}
              className="-mt-8 font-serif text-xl md:text-2xl leading-relaxed text-cream animate-fade-up"
            >
              {t.quote}
            </p>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="font-semibold text-cream">{t.name}</p>
                <p className="text-sm text-cream/60">{t.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous"
                  onClick={() => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="grid place-items-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1.5 px-2">
                  {TESTIMONIALS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === idx ? "w-6 bg-teal" : "w-1.5 bg-cream/30"
                      }`}
                    />
                  ))}
                </div>
                <button
                  aria-label="Next"
                  onClick={() => setIdx((i) => (i + 1) % TESTIMONIALS.length)}
                  className="grid place-items-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
