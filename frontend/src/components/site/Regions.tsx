import lisbon from "@/assets/region-lisbon.jpg";
import marrakesh from "@/assets/region-marrakesh.jpg";
import reykjavik from "@/assets/region-reykjavik.jpg";
import hanoi from "@/assets/region-hanoi.jpg";
import kyoto from "@/assets/region-kyoto.jpg";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const regions = [
  { name: "Delhi", country: "India", art: <DelhiGate />, loops: 1380 },
  { name: "Mumbai", country: "India", art: <MumbaiSea />, loops: 1640 },
  { name: "Chennai", country: "India", art: <ChennaiCoast />, loops: 1120 },
  { name: "Puri", country: "India", art: <PuriShore />, loops: 620 },
  { name: "Jaipur", country: "India", art: <JaipurPalace />, loops: 980 },
  { name: "Srinagar", country: "India", art: <SrinagarLake />, loops: 740 },
  { name: "Ahmedabad", country: "India", art: <AhmedabadStepwell />, loops: 880 },
  { name: "Sikkim", country: "India", art: <SikkimPeaks />, loops: 560 },
  { name: "Lisbon", country: "Portugal", img: lisbon, loops: 1240 },
  { name: "Marrakesh", country: "Morocco", img: marrakesh, loops: 980 },
  { name: "Reykjavik", country: "Iceland", img: reykjavik, loops: 612 },
  { name: "Hanoi", country: "Vietnam", img: hanoi, loops: 1810 },
  { name: "Kyoto", country: "Japan", img: kyoto, loops: 2104 },
];

export function Regions() {
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {regions.map((r) => (
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
                {"img" in r ? (
                  <motion.img
                    src={r.img}
                    alt={`${r.name}, ${r.country}`}
                    width={768}
                    height={896}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                  />
                ) : (
                  <div className="absolute inset-0" aria-hidden="true">
                    {r.art}
                  </div>
                )}
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
    </section>
  );
}

function DelhiGate() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="delhiSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7e1c9" />
          <stop offset="100%" stopColor="#f8f4ee" />
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#delhiSky)" />
      <rect y="430" width="600" height="320" fill="#d6a27c" />
      <rect x="140" y="260" width="320" height="270" rx="22" fill="#b8744f" />
      <rect x="190" y="320" width="220" height="190" rx="16" fill="#e3b28a" />
      <rect x="240" y="360" width="120" height="150" rx="12" fill="#8b4d33" />
    </svg>
  );
}

function MumbaiSea() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="750" fill="#e3eff6" />
      <rect y="430" width="600" height="320" fill="#2f6e82" />
      <path d="M0 430 C120 380, 220 470, 320 430 C420 390, 520 470, 600 430 V750 H0 Z" fill="#255a6a" />
      <rect x="90" y="260" width="420" height="140" rx="18" fill="#d5c2a8" />
      <rect x="140" y="290" width="120" height="110" rx="12" fill="#b69d85" />
      <rect x="280" y="290" width="120" height="110" rx="12" fill="#b69d85" />
      <rect x="420" y="290" width="60" height="110" rx="10" fill="#b69d85" />
    </svg>
  );
}

function ChennaiCoast() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="750" fill="#f7efe2" />
      <rect y="420" width="600" height="330" fill="#c2a184" />
      <rect y="500" width="600" height="250" fill="#4b8b84" />
      <path d="M40 470 C150 450, 240 510, 360 480" stroke="#dfe8e5" strokeWidth="10" opacity="0.6" fill="none" />
      <rect x="80" y="260" width="160" height="140" rx="20" fill="#a06d53" />
      <rect x="260" y="240" width="260" height="180" rx="20" fill="#c58a67" />
    </svg>
  );
}

function PuriShore() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="750" fill="#f5efe9" />
      <rect y="420" width="600" height="330" fill="#d9c1a6" />
      <rect y="520" width="600" height="230" fill="#3e7c7b" />
      <path d="M120 500 C200 460, 320 540, 420 500" stroke="#eef4f0" strokeWidth="10" opacity="0.6" fill="none" />
      <rect x="190" y="260" width="220" height="150" rx="20" fill="#b98362" />
      <rect x="230" y="300" width="140" height="110" rx="14" fill="#e7c2a6" />
    </svg>
  );
}

function JaipurPalace() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="750" fill="#f9e6d2" />
      <rect y="420" width="600" height="330" fill="#f0b08b" />
      <rect x="110" y="250" width="380" height="240" rx="24" fill="#d17955" />
      <rect x="160" y="300" width="280" height="170" rx="16" fill="#f2c0a2" />
      <circle cx="160" cy="240" r="50" fill="#f3c98b" />
    </svg>
  );
}

function SrinagarLake() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="750" fill="#e3eef5" />
      <rect y="440" width="600" height="310" fill="#4e7d8b" />
      <path d="M0 440 L120 330 L240 440 L360 320 L520 440 L600 360 V750 H0 Z" fill="#37545c" />
      <rect x="140" y="320" width="160" height="100" rx="16" fill="#c7d6d8" />
      <rect x="330" y="300" width="180" height="120" rx="16" fill="#e8efe9" />
    </svg>
  );
}

function AhmedabadStepwell() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="750" fill="#efe6da" />
      <rect y="430" width="600" height="320" fill="#c59b72" />
      <path d="M80 420 L520 420 L420 620 L180 620 Z" fill="#9f7250" />
      <path d="M150 460 L450 460 L380 590 L220 590 Z" fill="#d8b48f" />
      <rect x="200" y="260" width="200" height="140" rx="18" fill="#b67f5b" />
    </svg>
  );
}

function SikkimPeaks() {
  return (
    <svg viewBox="0 0 600 750" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="750" fill="#e6f2ef" />
      <path d="M0 520 L140 360 L260 520 L360 370 L520 520 L600 430 V750 H0 Z" fill="#58716d" />
      <path d="M0 600 L160 440 L280 600 L380 460 L540 600 L600 520 V750 H0 Z" fill="#3f5a56" />
      <rect y="600" width="600" height="150" fill="#6d8e80" />
      <circle cx="500" cy="220" r="60" fill="#f0c7a0" />
    </svg>
  );
}
