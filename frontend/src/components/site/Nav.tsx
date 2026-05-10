import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { label: "Activities", href: "/activity-search" },
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
    <motion.header
      className={`fixed top-0 inset-x-0 z-50 ${
        scrolled ? "glass border-b border-border/60" : "bg-transparent"
      }`}
      initial={false}
      animate={{
        boxShadow: scrolled
          ? "0 16px 40px -24px color-mix(in oklab, var(--charcoal) 30%, transparent)"
          : "none",
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
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
            <motion.a
              key={l.href}
              href={l.href}
              className="text-charcoal/70"
              whileHover={{ color: "var(--color-teal)" }}
            >
              {l.label}
            </motion.a>
          ))}
          <motion.a
            href="#signup"
            className="text-charcoal/70"
            whileHover={{ color: "var(--color-teal)" }}
          >
            Sign in
          </motion.a>
          <motion.a
            href="#signup"
            className="inline-flex items-center rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2 font-medium shadow-card"
            whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
            whileTap={{ scale: 0.98 }}
          >
            Start free
          </motion.a>
        </nav>

        <motion.button
          aria-label="Menu"
          className="md:hidden p-2 rounded-lg"
          onClick={() => setOpen((o) => !o)}
          whileHover={{ backgroundColor: "var(--color-muted)" }}
          whileTap={{ scale: 0.96 }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden glass border-t border-border/60"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-charcoal/80"
                  whileHover={{ color: "var(--color-teal)" }}
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.a
                href="#signup"
                onClick={() => setOpen(false)}
                className="mt-2 text-center rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 font-medium"
                whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                whileTap={{ scale: 0.98 }}
              >
                Start free
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
