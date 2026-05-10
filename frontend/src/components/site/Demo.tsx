import { useMemo, useState } from "react";
import { Calendar, Trash2, Plus, Check } from "lucide-react";

type City = { name: string; price: number };

const ALL_CITIES: City[] = [
  { name: "Lisbon", price: 420 },
  { name: "Marrakesh", price: 380 },
  { name: "Reykjavik", price: 560 },
  { name: "Hanoi", price: 330 },
];

const DATE_RANGES = ["May 14 – May 19", "Jun 2 – Jun 9", "Jul 4 – Jul 10"];

export function Demo() {
  const [selected, setSelected] = useState<string[]>(["Lisbon", "Marrakesh"]);
  const [range, setRange] = useState(DATE_RANGES[0]);

  const cities = useMemo(
    () => ALL_CITIES.filter((c) => selected.includes(c.name)),
    [selected]
  );
  const total = cities.reduce((s, c) => s + c.price, 0);

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));

  const removeLast = () => setSelected((s) => s.slice(0, -1));

  return (
    <section id="demo" className="py-24 md:py-32 bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
            Try It Live
          </span>
          <h2 className="mt-3 font-display font-bold text-charcoal text-3xl md:text-5xl tracking-tight text-balance">
            Build a mini-itinerary in seconds.
          </h2>
          <p className="mt-4 text-charcoal/70 text-lg">
            Click to add a city, pick your dates, and watch Traveloop update your costs
            live. Every choice is reflected instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Builder */}
          <div className="lg:col-span-3 rounded-3xl bg-card p-8 shadow-card border border-border/60">
            <h3 className="font-display font-semibold text-charcoal text-lg">Choose cities</h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {ALL_CITIES.map((c) => {
                const active = selected.includes(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => toggle(c.name)}
                    className={`group inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                      active
                        ? "bg-teal text-teal-foreground border-teal shadow-card"
                        : "border-teal/40 text-charcoal hover:border-teal hover:bg-teal/5"
                    }`}
                  >
                    {active ? <Check size={14} /> : <Plus size={14} />}
                    {c.name}
                  </button>
                );
              })}
            </div>

            <h3 className="font-display font-semibold text-charcoal text-lg mt-8">
              Pick your window
            </h3>
            <div className="mt-4 flex flex-wrap gap-5">
              {DATE_RANGES.map((d) => {
                const active = range === d;
                return (
                  <button
                    key={d}
                    onClick={() => setRange(d)}
                    className="group relative inline-flex items-center gap-2 text-sm font-medium text-charcoal pb-1.5"
                  >
                    <Calendar size={15} className="text-teal" />
                    {d}
                    <span
                      className={`absolute left-0 -bottom-0.5 h-[2px] bg-teal transition-all duration-300 ${
                        active ? "w-full" : "w-0 group-hover:w-1/2"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <p className="text-xs text-charcoal/60">
                {cities.length} {cities.length === 1 ? "stop" : "stops"} · auto-synced
              </p>
              <button
                onClick={removeLast}
                disabled={!cities.length}
                className="inline-flex items-center gap-2 text-sm text-charcoal/70 hover:text-coral disabled:opacity-40 transition-colors"
              >
                <Trash2 size={14} /> Remove last
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 rounded-3xl bg-gradient-dark text-cream p-8 shadow-elegant relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
              Live Itinerary
            </p>
            <h3 className="mt-2 font-display font-semibold text-2xl">{range}</h3>
            <p className="text-sm text-cream/60">
              {cities.length} {cities.length === 1 ? "stop" : "stops"}
            </p>

            <ul className="mt-6 space-y-3 relative">
              {cities.length === 0 && (
                <li className="rounded-xl border border-cream/10 p-4 text-sm text-cream/50">
                  Add a city to begin shaping your loop.
                </li>
              )}
              {cities.map((c) => (
                <li
                  key={c.name}
                  className="animate-fade-up rounded-xl border border-cream/10 bg-white/[0.04] p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-display font-semibold">{c.name}</p>
                    <p className="text-xs text-cream/55">Hotels + Experiences</p>
                  </div>
                  <span className="font-display font-semibold text-gold">${c.price}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-black/30 border border-cream/10 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/55">
                    Total est. spend
                  </p>
                  <p className="text-xs text-cream/45 mt-1">
                    Live updates with every city you add.
                  </p>
                </div>
                <span
                  key={total}
                  className="font-display font-bold text-3xl text-gold animate-flip-y"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
