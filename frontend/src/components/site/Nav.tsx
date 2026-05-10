import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Stories", href: "#stories" },
  { label: "Pricing", href: "#signup" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold tracking-tight shadow-glow">
            TL
          </span>
          <span className="font-display font-semibold text-lg tracking-tight text-charcoal">
            Traveloop
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-charcoal/70 hover:text-teal transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a href="#signup" className="text-charcoal/70 hover:text-teal transition-colors">
            Sign in
          </a>
          <a
            href="#signup"
            className="inline-flex items-center rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2 font-medium shadow-card hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Start free
          </a>
        </nav>

        <button
          aria-label="Menu"
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border/60 animate-fade-up">
          <div className="px-6 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2 text-charcoal/80 hover:text-teal"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#signup"
              onClick={() => setOpen(false)}
              className="mt-2 text-center rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 font-medium"
            >
              Start free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
