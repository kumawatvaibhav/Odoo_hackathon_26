import lisbon from "@/assets/region-lisbon.jpg";
import marrakesh from "@/assets/region-marrakesh.jpg";
import reykjavik from "@/assets/region-reykjavik.jpg";
import hanoi from "@/assets/region-hanoi.jpg";
import kyoto from "@/assets/region-kyoto.jpg";
import { ArrowUpRight } from "lucide-react";

const regions = [
  { name: "Lisbon", country: "Portugal", img: lisbon, loops: 1240 },
  { name: "Marrakesh", country: "Morocco", img: marrakesh, loops: 980 },
  { name: "Reykjavik", country: "Iceland", img: reykjavik, loops: 612 },
  { name: "Hanoi", country: "Vietnam", img: hanoi, loops: 1810 },
  { name: "Kyoto", country: "Japan", img: kyoto, loops: 2104 },
];

export function Regions() {
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
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal hover:text-teal transition-colors group"
          >
            See all regions
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {regions.map((r, i) => (
            <article
              key={r.name}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card cursor-pointer animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <img
                src={r.img}
                alt={`${r.name}, ${r.country}`}
                width={768}
                height={896}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
              <span className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-cream/90 text-charcoal opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={15} />
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
