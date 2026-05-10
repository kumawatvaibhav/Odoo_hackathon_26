import { Check, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

const FEATURES = [
  "Instant itinerary builder",
  "Budget clarity in real time",
  "Private collaboration spaces",
  "Trusted by global travelers",
];

export function Signup() {
  const { user } = useAuth();

  // If user is already signed in, show a different CTA
  if (user) {
    return (
      <section id="signup" className="py-24 md:py-32 bg-cream">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
              Welcome back
            </span>
            <h2 className="mt-3 font-display font-bold text-charcoal text-3xl md:text-5xl tracking-tight text-balance">
              Ready for your next adventure?
            </h2>
            <p className="mt-4 text-charcoal/70 text-lg max-w-md">
              You're signed in as <span className="font-medium text-charcoal">{user.first_name}</span>. 
              Pick up where you left off or start a brand-new loop.
            </p>
            <ul className="mt-8 space-y-4">
              {FEATURES.map((f, i) => (
                <li
                  key={f}
                  className="flex items-center gap-3 animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-teal/15 text-teal">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="text-charcoal">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-card p-8 md:p-10 border-2 border-teal/40 shadow-elegant text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-xl font-bold mb-5">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <h3 className="font-display font-semibold text-2xl text-charcoal">
              Welcome, {user.first_name}!
            </h3>
            <p className="mt-2 text-sm text-charcoal/60">
              Your loops are waiting for you.
            </p>
            <motion.a
              href="/"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground py-3.5 font-semibold shadow-card hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
              whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
              whileTap={{ scale: 0.98 }}
            >
              Go to dashboard <ArrowRight size={18} />
            </motion.a>
          </div>
        </div>
      </section>
    );
  }

  // Signed-out: CTA to go to /signup page
  return (
    <section id="signup" className="py-24 md:py-32 bg-cream">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
            Free Forever
          </span>
          <h2 className="mt-3 font-display font-bold text-charcoal text-3xl md:text-5xl tracking-tight text-balance">
            Start planning with confidence.
          </h2>
          <p className="mt-4 text-charcoal/70 text-lg max-w-md">
            Everything you need to design unforgettable loops — no card, no clutter.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((f, i) => (
              <li
                key={f}
                className="flex items-center gap-3 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="grid place-items-center w-6 h-6 rounded-full bg-teal/15 text-teal">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="text-charcoal">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-card p-8 md:p-10 border-2 border-teal/40 shadow-elegant">
          <h3 className="font-display font-semibold text-2xl text-charcoal">
            Start planning free
          </h3>
          <p className="mt-1 text-sm text-charcoal/60">
            Create your account in under a minute. No credit card required.
          </p>

          <div className="mt-7 space-y-5">
            <Link to="/signup">
              <motion.span
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground py-3.5 font-semibold shadow-card hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                whileTap={{ scale: 0.98 }}
              >
                Create free account <ArrowRight size={18} />
              </motion.span>
            </Link>

            <p className="text-center text-sm text-charcoal/55">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal font-medium hover:text-teal/80 transition-colors"
              >
                Sign in
              </Link>
            </p>

            <div className="flex items-center justify-center gap-5 text-xs text-charcoal/55">
              <span className="inline-flex items-center gap-1.5">
                <Lock size={12} /> 256-bit secure
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={12} /> GDPR ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
