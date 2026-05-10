import { useEffect, useState, useRef } from "react";
import { Menu, X, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

const links = [
  { label: "Activities", href: "/activity-search" },
  { label: "Community", href: "/community" },
  { label: "Try it", href: "#demo" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "";

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
        <a href="/#top" className="flex items-center gap-2.5 group">
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

          {user ? (
            /* ── Signed-in: User menu ── */
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 cursor-pointer"
                whileHover={{ y: -1, boxShadow: "0 8px 24px -12px color-mix(in oklab, var(--charcoal) 20%, transparent)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </span>
                <span className="text-sm font-medium text-charcoal max-w-[120px] truncate">
                  {user.first_name}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-charcoal/50 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-elegant overflow-hidden"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-border/60">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-charcoal/50 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-muted/60 transition-colors cursor-pointer"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserIcon size={15} />
                        Profile
                      </button>
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Signed-out: Sign in + Start free ── */
            <>
              <Link to="/login">
                <motion.span
                  className="text-charcoal/70 cursor-pointer"
                  whileHover={{ color: "var(--color-teal)" }}
                >
                  Sign in
                </motion.span>
              </Link>
              <Link to="/signup">
                <motion.span
                  className="inline-flex items-center rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2 font-medium shadow-card cursor-pointer"
                  whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start free
                </motion.span>
              </Link>
            </>
          )}
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

              {user ? (
                <>
                  {/* Mobile: user info + signout */}
                  <div className="mt-2 pt-3 border-t border-border/60">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">
                        {initials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-charcoal/50">{user.email}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={async () => {
                        setOpen(false);
                        await signout();
                      }}
                      className="w-full mt-1 text-center rounded-xl border border-destructive/30 text-destructive px-4 py-2.5 font-medium"
                      whileHover={{ y: -2, backgroundColor: "rgba(220,38,38,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign out
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <motion.span
                      className="block py-2 text-charcoal/80"
                      whileHover={{ color: "var(--color-teal)" }}
                    >
                      Sign in
                    </motion.span>
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)}>
                    <motion.span
                      className="mt-2 block text-center rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 font-medium"
                      whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start free
                    </motion.span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
