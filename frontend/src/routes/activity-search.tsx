import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PlanFab } from "@/components/site/PlanFab";

const activities = [
  {
    name: "Sunrise Varanasi Ghats Cruise",
    city: "Varanasi, India",
    duration: "2h 30m",
    price: "INR 1,450",
    rating: "4.8",
    detail:
      "Float past the riverfront temples with a local guide and a chai tasting on board.",
    art: <GhatCruise />,
  },
  {
    name: "Jaipur Heritage Bazaar Walk",
    city: "Jaipur, India",
    duration: "3h",
    price: "INR 1,200",
    rating: "4.7",
    detail:
      "Textiles, gemstone ateliers, and a curated route through the Pink City alleys.",
    art: <BazaarWalk />,
  },
  {
    name: "Srinagar Houseboat Atelier",
    city: "Srinagar, India",
    duration: "4h",
    price: "INR 2,600",
    rating: "4.9",
    detail:
      "Meet artisan families crafting walnut woodwork with a lakeside lunch.",
    art: <Houseboat />,
  },
  {
    name: "Lisbon Miradouros Circuit",
    city: "Lisbon, Portugal",
    duration: "3h 15m",
    price: "EUR 38",
    rating: "4.6",
    detail:
      "Golden-hour viewpoints with a local photographer and tram ride tickets.",
    art: <LisbonView />,
  },
  {
    name: "Kyoto Lanterns & Tea",
    city: "Kyoto, Japan",
    duration: "2h",
    price: "JPY 5,400",
    rating: "4.9",
    detail:
      "A gentle dusk walk through Gion paired with a seasonal tea ceremony.",
    art: <KyotoLantern />,
  },
  {
    name: "Marrakesh Rooftop Tasting",
    city: "Marrakesh, Morocco",
    duration: "2h 45m",
    price: "MAD 420",
    rating: "4.7",
    detail:
      "Mint tea rituals and panoramic medina views with a chef host.",
    art: <MarrakeshRooftop />,
  },
];

export const Route = createFileRoute("/activity-search")({
  head: () => ({
    meta: [
      { title: "Traveloop — Activity Search" },
      {
        name: "description",
        content:
          "Curated activity search for multi-city travel loops, tailored to local culture and timing.",
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
  component: ActivitySearch,
});

function ActivitySearch() {
  const orbitOne = useRef<HTMLDivElement | null>(null);
  const orbitTwo = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (orbitOne.current) {
        gsap.to(orbitOne.current, {
          x: 24,
          y: -16,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (orbitTwo.current) {
        gsap.to(orbitTwo.current, {
          x: -18,
          y: 20,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <section className="relative pt-24 pb-12">
          <div className="absolute inset-0 pointer-events-none">
            <div
              ref={orbitOne}
              className="absolute top-16 right-[8%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(215,170,140,0.35),rgba(215,170,140,0))]"
            />
            <div
              ref={orbitTwo}
              className="absolute bottom-10 left-[5%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(64,140,142,0.35),rgba(64,140,142,0))]"
            />
           </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
                  Activity Search
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display font-bold text-charcoal">
                  Find experiences that match your loop.
                </h1>
                <p className="mt-3 max-w-2xl text-base sm:text-lg text-charcoal/70">
                  Each listing blends local craft, flexible timing, and a host you can trust.
                </p>
              </div>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-card px-4 py-2 text-xs uppercase tracking-[0.2em] text-charcoal/70"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Sparkles size={14} className="text-teal" /> Curated weekly
              </motion.div>
            </div>

            <motion.div
              className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-elegant md:flex-row md:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <label className="flex flex-1 items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                <Search size={18} className="text-teal" />
                <input
                  placeholder="Search city or experience"
                  className="w-full bg-transparent text-sm sm:text-base outline-none text-charcoal placeholder:text-charcoal/40"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {["Group by", "Filter", "Sort by"].map((label) => (
                  <motion.button
                    key={label}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-xs sm:text-sm font-medium text-charcoal/80"
                    whileHover={{ y: -2, boxShadow: "0 10px 26px -14px color-mix(in oklab, var(--charcoal) 26%, transparent)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {label}
                  </motion.button>
                ))}
                <motion.button
                  className="rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2 text-sm font-semibold shadow-card"
                  whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Search
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-charcoal/60">
                <MapPin size={16} className="text-teal" /> Showing 6 highlights
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-charcoal/50">
                Scroll for more
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-4 md:snap-x md:snap-mandatory">
              {activities.map((activity) => (
                <motion.article
                  key={activity.name}
                  className="md:min-w-[360px] md:max-w-[360px] flex-1 rounded-2xl border border-border/70 bg-card shadow-card overflow-hidden md:snap-start"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -8, boxShadow: "0 18px 40px -18px color-mix(in oklab, var(--charcoal) 28%, transparent)" }}
                >
                  <div className="h-44 w-full">{activity.art}</div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-teal">
                          {activity.city}
                        </p>
                        <h3 className="mt-2 text-lg font-display font-semibold text-charcoal">
                          {activity.name}
                        </h3>
                      </div>
                      <span className="rounded-full border border-teal/30 px-2.5 py-1 text-xs font-semibold text-teal">
                        {activity.rating}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-charcoal/70">{activity.detail}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-charcoal/60">
                      <span>{activity.duration}</span>
                      <span>{activity.price}</span>
                    </div>
                    <motion.button
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-charcoal"
                      whileHover="hover"
                      initial="rest"
                      animate="rest"
                    >
                      Preview details
                      <motion.span
                        className="h-[2px] w-10 origin-left rounded-full bg-charcoal/70"
                        variants={{
                          rest: { scaleX: 0 },
                          hover: { scaleX: 1, transition: { duration: 0.3 } },
                        }}
                      />
                    </motion.button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <PlanFab />
    </div>
  );
}

function GhatCruise() {
  return (
    <svg viewBox="0 0 600 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="320" fill="#f4e8da" />
      <rect y="180" width="600" height="140" fill="#5f8c8a" />
      <path d="M0 180 L120 120 L240 180 L360 130 L480 180 L600 140 V320 H0 Z" fill="#3f6a68" />
      <rect x="60" y="100" width="220" height="70" rx="12" fill="#c79a70" />
      <rect x="310" y="90" width="240" height="90" rx="14" fill="#a86d4a" />
      <path d="M200 220 C280 200, 360 240, 440 220" stroke="#d8f0ed" strokeWidth="8" opacity="0.6" fill="none" />
    </svg>
  );
}

function BazaarWalk() {
  return (
    <svg viewBox="0 0 600 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="320" fill="#f9ead6" />
      <rect y="170" width="600" height="150" fill="#e3b58d" />
      <rect x="40" y="80" width="200" height="90" rx="12" fill="#c2704a" />
      <rect x="260" y="70" width="140" height="100" rx="12" fill="#d38c61" />
      <rect x="420" y="90" width="140" height="80" rx="12" fill="#a75d3e" />
      <circle cx="520" cy="50" r="32" fill="#f0c27b" />
    </svg>
  );
}

function Houseboat() {
  return (
    <svg viewBox="0 0 600 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="320" fill="#e8f0f1" />
      <rect y="170" width="600" height="150" fill="#4e7b84" />
      <path d="M80 200 L520 200 L460 260 L140 260 Z" fill="#c2d1d4" />
      <rect x="150" y="120" width="300" height="80" rx="14" fill="#8b6b52" />
      <rect x="210" y="140" width="180" height="50" rx="10" fill="#d9c2a6" />
    </svg>
  );
}

function LisbonView() {
  return (
    <svg viewBox="0 0 600 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="320" fill="#dfe9f7" />
      <rect y="180" width="600" height="140" fill="#caa27e" />
      <rect x="60" y="90" width="180" height="90" rx="12" fill="#b86b4d" />
      <rect x="260" y="70" width="160" height="110" rx="12" fill="#e4c09d" />
      <rect x="440" y="100" width="120" height="80" rx="12" fill="#a85c45" />
      <circle cx="470" cy="50" r="30" fill="#f0c27b" />
    </svg>
  );
}

function KyotoLantern() {
  return (
    <svg viewBox="0 0 600 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="320" fill="#e6efe6" />
      <rect y="190" width="600" height="130" fill="#7c9b86" />
      <rect x="80" y="100" width="200" height="90" rx="12" fill="#4c5e53" />
      <rect x="320" y="90" width="200" height="100" rx="12" fill="#6b7c70" />
      <circle cx="440" cy="130" r="24" fill="#f1b474" />
      <circle cx="480" cy="130" r="16" fill="#f1b474" />
    </svg>
  );
}

function MarrakeshRooftop() {
  return (
    <svg viewBox="0 0 600 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="320" fill="#f6e6d4" />
      <rect y="180" width="600" height="140" fill="#c5845b" />
      <rect x="80" y="100" width="200" height="80" rx="12" fill="#9b563a" />
      <rect x="300" y="80" width="220" height="100" rx="12" fill="#d2a07a" />
      <circle cx="470" cy="50" r="30" fill="#f0c27b" />
    </svg>
  );
}
