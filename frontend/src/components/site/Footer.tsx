import { Twitter, Instagram, Linkedin, Facebook } from "lucide-react";

const groups = [
  { title: "Product", links: ["Features", "Demo", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "Status"] },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream/80 border-t border-teal/40">
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold">
              TL
            </span>
            <span className="font-display font-semibold text-lg text-cream">Traveloop</span>
          </div>
          <p className="mt-4 text-sm text-cream/55 max-w-xs">
            The interactive way to design multi-city travel loops — designed for the
            curious traveler.
          </p>
          <div className="mt-6 flex gap-3">
            {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-teal hover:text-charcoal transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal mb-4">
              {g.title}
            </p>
            <ul className="space-y-2.5 text-sm">
              {g.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-teal transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-cream/50">
          <p>© 2026 Traveloop. Travel planning, refined.</p>
          <p>Crafted with intention. Built for explorers.</p>
        </div>
      </div>
    </footer>
  );
}
