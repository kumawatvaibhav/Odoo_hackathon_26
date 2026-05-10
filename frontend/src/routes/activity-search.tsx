import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PlanFab } from "@/components/site/PlanFab";
import banner from "@/assets/hero-banner.jpg";
import {
  fetchPexelsPhotos,
  fetchPexelsVideos,
  pickPexelsVideoFile,
} from "@/lib/pexels";

const activities = [
  {
    name: "Sunrise Varanasi Ghats Cruise",
    city: "Varanasi, India",
    duration: "2h 30m",
    price: "INR 1,450",
    rating: "4.8",
    query: "Varanasi ghats sunrise boat",
    detail:
      "Float past the riverfront temples with a local guide and a chai tasting on board.",
  },
  {
    name: "Jaipur Heritage Bazaar Walk",
    city: "Jaipur, India",
    duration: "3h",
    price: "INR 1,200",
    rating: "4.7",
    query: "Jaipur bazaar streets",
    detail:
      "Textiles, gemstone ateliers, and a curated route through the Pink City alleys.",
  },
  {
    name: "Srinagar Houseboat Atelier",
    city: "Srinagar, India",
    duration: "4h",
    price: "INR 2,600",
    rating: "4.9",
    query: "Srinagar houseboat lake",
    detail:
      "Meet artisan families crafting walnut woodwork with a lakeside lunch.",
  },
  {
    name: "Lisbon Miradouros Circuit",
    city: "Lisbon, Portugal",
    duration: "3h 15m",
    price: "EUR 38",
    rating: "4.6",
    query: "Lisbon miradouro viewpoint",
    detail:
      "Golden-hour viewpoints with a local photographer and tram ride tickets.",
  },
  {
    name: "Kyoto Lanterns & Tea",
    city: "Kyoto, Japan",
    duration: "2h",
    price: "JPY 5,400",
    rating: "4.9",
    query: "Kyoto lantern street",
    detail:
      "A gentle dusk walk through Gion paired with a seasonal tea ceremony.",
  },
  {
    name: "Marrakesh Rooftop Tasting",
    city: "Marrakesh, Morocco",
    duration: "2h 45m",
    price: "MAD 420",
    rating: "4.7",
    query: "Marrakesh rooftop sunset",
    detail:
      "Mint tea rituals and panoramic medina views with a chef host.",
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [media, setMedia] = useState<
    Record<string, { type: "image" | "video"; src: string; alt: string }>
  >({});
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const filteredActivities = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return activities;
    return activities.filter((activity) =>
      [activity.name, activity.city, activity.detail]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [debouncedQuery]);
  const visibleActivities = useMemo(
    () => filteredActivities.slice(0, visibleCount),
    [filteredActivities, visibleCount]
  );

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

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((count) =>
              Math.min(count + 3, filteredActivities.length)
            );
          }
        });
      },
      { rootMargin: "120px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredActivities.length]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    setVisibleCount(Math.min(3, filteredActivities.length));
  }, [debouncedQuery, filteredActivities.length]);

  useEffect(() => {
    let active = true;

    const loadMedia = async () => {
      const [videoResult] = await fetchPexelsVideos(
        "Varanasi river sunrise",
        1
      );
      const videoSrc = videoResult ? pickPexelsVideoFile(videoResult) : null;

      const photos = await Promise.all(
        activities.map(async (activity) => {
          const [photo] = await fetchPexelsPhotos(activity.query, 1);
          return {
            name: activity.name,
            src: photo?.src?.large2x || photo?.src?.landscape || banner,
            alt: photo?.alt || `${activity.name} in ${activity.city}`,
          };
        })
      );

      if (!active) return;
      const next: Record<
        string,
        { type: "image" | "video"; src: string; alt: string }
      > = {};
      photos.forEach((item, index) => {
        if (index === 0 && videoSrc) {
          next[item.name] = { type: "video", src: videoSrc, alt: item.alt };
        } else {
          next[item.name] = { type: "image", src: item.src, alt: item.alt };
        }
      });
      setMedia(next);
    };

    loadMedia();

    return () => {
      active = false;
    };
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
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
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
                <MapPin size={16} className="text-teal" />
                Showing {Math.min(visibleCount, filteredActivities.length)} of {filteredActivities.length}
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-charcoal/50">
                Loading as you scroll
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleActivities.map((activity) => (
                <motion.article
                  key={activity.name}
                  className="rounded-2xl border border-border/70 bg-card shadow-card overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -8, boxShadow: "0 18px 40px -18px color-mix(in oklab, var(--charcoal) 28%, transparent)" }}
                >
                  <div className="h-44 w-full overflow-hidden">
                    {media[activity.name]?.type === "video" ? (
                      <video
                        src={media[activity.name].src}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={banner}
                      />
                    ) : (
                      <img
                        src={media[activity.name]?.src || banner}
                        alt={media[activity.name]?.alt || activity.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
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
            {visibleCount < filteredActivities.length && (
              <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
            )}
          </div>
        </section>
      </main>
      <Footer />
      <PlanFab />
    </div>
  );
}
