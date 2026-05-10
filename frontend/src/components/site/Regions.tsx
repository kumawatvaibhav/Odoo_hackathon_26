import { useEffect, useMemo, useState } from "react";
import lisbon from "@/assets/region-lisbon.jpg";
import marrakesh from "@/assets/region-marrakesh.jpg";
import reykjavik from "@/assets/region-reykjavik.jpg";
import hanoi from "@/assets/region-hanoi.jpg";
import kyoto from "@/assets/region-kyoto.jpg";
import banner from "@/assets/hero-banner.jpg";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { fetchPexelsPhotos } from "@/lib/pexels";

const indiaRegions = [
  { name: "Delhi", country: "India", query: "Delhi India travel" },
  { name: "Mumbai", country: "India", query: "Mumbai India travel" },
  { name: "Chennai", country: "India", query: "Chennai India travel" },
  { name: "Puri", country: "India", query: "Puri beach India" },
  { name: "Jaipur", country: "India", query: "Jaipur India palace" },
  { name: "Srinagar", country: "India", query: "Srinagar lake India" },
  { name: "Ahmedabad", country: "India", query: "Ahmedabad India architecture" },
  { name: "Sikkim", country: "India", query: "Sikkim India mountains" },
];

const worldRegions = [
  { name: "Lisbon", country: "Portugal", img: lisbon, loops: 1240 },
  { name: "Marrakesh", country: "Morocco", img: marrakesh, loops: 980 },
  { name: "Reykjavik", country: "Iceland", img: reykjavik, loops: 612 },
  { name: "Hanoi", country: "Vietnam", img: hanoi, loops: 1810 },
  { name: "Kyoto", country: "Japan", img: kyoto, loops: 2104 },
];

export function Regions() {
  const [indiaMedia, setIndiaMedia] = useState<Record<string, string>>({});
  const [indiaAlt, setIndiaAlt] = useState<Record<string, string>>({});
  const fallbackImg = useMemo(() => banner, []);

  const cardVariants = {
    rest: { y: 0, boxShadow: "var(--shadow-card)" },
    hover: {
      y: -8,
      boxShadow: "0 18px 40px -18px color-mix(in oklab, var(--charcoal) 28%, transparent)",
    },
  };
  const linkVariants = {
    rest: { color: "var(--color-charcoal)" },
    hover: { color: "var(--color-teal)" },
  };
  const arrowVariants = {
    rest: { x: 0, y: 0 },
    hover: { x: 2, y: -2 },
  };
  const iconVariants = {
    rest: { opacity: 0, scale: 0.9 },
    hover: { opacity: 1, scale: 1 },
  };

  useEffect(() => {
    let active = true;

    const loadIndia = async () => {
      const results = await Promise.all(
        indiaRegions.map(async (region) => {
          const [photo] = await fetchPexelsPhotos(region.query, 1);
          return {
            name: region.name,
            src: photo?.src?.large2x || photo?.src?.landscape || fallbackImg,
            alt: photo?.alt || `${region.name}, ${region.country}`,
          };
        })
      );

      if (!active) return;
      const nextSrc: Record<string, string> = {};
      const nextAlt: Record<string, string> = {};
      results.forEach((item) => {
        nextSrc[item.name] = item.src;
        nextAlt[item.name] = item.alt;
      });
      setIndiaMedia(nextSrc);
      setIndiaAlt(nextAlt);
    };

    loadIndia();

    return () => {
      active = false;
    };
  }, [fallbackImg]);

  return (
    <section id="regions" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
              Top Regional Selections
            </span>
            <h2 className="mt-2 font-display font-bold text-charcoal text-2xl md:text-4xl tracking-tight">
              Hand-picked, in season now.
            </h2>
          </div>
          <motion.a
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal"
            variants={linkVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
          >
            See all regions
            <motion.span variants={arrowVariants}>
              <ArrowUpRight size={16} />
            </motion.span>
          </motion.a>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal/70">
                India
              </h3>
              <span className="text-xs uppercase tracking-[0.2em] text-charcoal/40">
                Regional picks
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {indiaRegions.map((r) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.article
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card cursor-pointer"
                    variants={cardVariants}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                  >
                    <motion.img
                      src={indiaMedia[r.name] || fallbackImg}
                      alt={indiaAlt[r.name] || `${r.name}, ${r.country}`}
                      width={768}
                      height={896}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end text-cream">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-cream/70">
                        {r.country}
                      </p>
                      <h3 className="font-display font-semibold text-lg leading-tight">
                        {r.name}
                      </h3>
                    </div>
                    <motion.span
                      className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-cream/90 text-charcoal"
                      variants={iconVariants}
                    >
                      <ArrowUpRight size={15} />
                    </motion.span>
                  </motion.article>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal/70">
                World
              </h3>
              <span className="text-xs uppercase tracking-[0.2em] text-charcoal/40">
                Seasonal favorites
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {worldRegions.map((r) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.article
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card cursor-pointer"
                    variants={cardVariants}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                  >
                    <motion.img
                      src={r.img}
                      alt={`${r.name}, ${r.country}`}
                      width={768}
                      height={896}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end text-cream">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-cream/70">
                        {r.country}
                      </p>
                      <h3 className="font-display font-semibold text-lg leading-tight">
                        {r.name}
                      </h3>
                      <p className="text-[11px] text-cream/60 mt-0.5">
                        {r.loops.toLocaleString()} loops
                      </p>
                    </div>
                    <motion.span
                      className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-cream/90 text-charcoal"
                      variants={iconVariants}
                    >
                      <ArrowUpRight size={15} />
                    </motion.span>
                  </motion.article>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
