import { Map, Wallet, Search, Users, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Multi-City Planning",
    desc: "Drag, drop, and reorder entire city blocks with live travel time insights.",
    accent: "var(--teal)",
  },
  {
    icon: Wallet,
    title: "Smart Budget Tracking",
    desc: "Visual budgets update in real time as you add stays, flights, and tours.",
    accent: "var(--coral)",
  },
  {
    icon: Search,
    title: "Activity Discovery",
    desc: "Search local experiences with curated highlights and instant saves.",
    accent: "var(--gold)",
  },
  {
    icon: Users,
    title: "Share & Collaborate",
    desc: "Invite co-travelers, assign tasks, and vote on must-do moments.",
    accent: "var(--teal)",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
            The Toolkit
          </span>
          <h2 className="mt-3 font-display font-bold text-charcoal text-3xl md:text-5xl tracking-tight text-balance">
            Everything you need to shape your route.
          </h2>
          <p className="mt-4 text-charcoal/70 text-lg">
            From drag-and-drop trip building to shared planning spaces, the Traveloop
            toolkit keeps every detail in sync.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="group relative rounded-2xl bg-card p-7 shadow-card border border-border/60 hover:-translate-y-2 hover:shadow-elegant transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className="grid place-items-center w-14 h-14 rounded-xl mb-6 transition-transform group-hover:scale-110"
                style={{ background: `color-mix(in oklab, ${f.accent} 14%, transparent)`, color: f.accent }}
              >
                <f.icon size={26} />
              </span>
              <h3 className="font-display font-semibold text-xl text-charcoal">{f.title}</h3>
              <p className="mt-2 text-sm text-charcoal/65 leading-relaxed">{f.desc}</p>
              <button className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal group/btn">
                <span className="relative">
                  Preview
                  <span
                    className="absolute -bottom-0.5 left-0 h-0.5 w-0 group-hover/btn:w-full transition-all duration-300"
                    style={{ background: f.accent }}
                  />
                </span>
                <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
              <span
                className="absolute inset-x-7 -top-px h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
