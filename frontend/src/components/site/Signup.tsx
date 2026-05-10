import { useMemo, useState } from "react";
import { Check, Lock, ShieldCheck, Loader2 } from "lucide-react";

const FEATURES = [
  "Instant itinerary builder",
  "Budget clarity in real time",
  "Private collaboration spaces",
  "Trusted by global travelers",
];

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const errors = useMemo(() => {
    return {
      name: name.trim().length === 0 ? "" : name.trim().length < 2 ? "Add your full name" : "",
      email:
        email.length === 0
          ? ""
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? "Enter a valid email"
          : "",
      password:
        password.length === 0 ? "" : password.length < 8 ? "At least 8 characters" : "",
    };
  }, [name, email, password]);

  const valid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 8 &&
    agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1200);
  };

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

        <form
          onSubmit={submit}
          className="rounded-3xl bg-card p-8 md:p-10 border-2 border-teal/40 shadow-elegant"
        >
          <h3 className="font-display font-semibold text-2xl text-charcoal">
            {done ? "You're in." : "Start planning free"}
          </h3>
          <p className="mt-1 text-sm text-charcoal/60">
            {done
              ? "Check your inbox to confirm and design your first loop."
              : "We will never sell your data. Cancel anytime."}
          </p>

          {!done && (
            <div className="mt-7 space-y-5">
              <Field
                label="Name"
                value={name}
                onChange={setName}
                error={errors.name}
                valid={!errors.name && name.length > 1}
                placeholder="Ada Lovelace"
              />
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                valid={!errors.email && email.length > 0}
                placeholder="ada@traveloop.com"
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                valid={!errors.password && password.length >= 8}
                hint="At least 8 characters"
                placeholder="••••••••"
              />

              <label className="flex items-start gap-3 text-sm text-charcoal/75 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 accent-[var(--teal)]"
                />
                I agree to the terms and the privacy policy.
              </label>

              <button
                type="submit"
                disabled={!valid || loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground py-3.5 font-semibold shadow-card hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating your account...
                  </>
                ) : (
                  "Start planning free"
                )}
              </button>

              <div className="flex items-center justify-center gap-5 text-xs text-charcoal/55">
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={12} /> 256-bit secure
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={12} /> GDPR ready
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  valid?: boolean;
  hint?: string;
  type?: string;
  placeholder?: string;
}) {
  const { label, value, onChange, error, valid, hint, type = "text", placeholder } = props;
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal/70 mb-2">
        {label} <span className="text-coral">*</span>
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border-2 bg-background px-4 py-3 pr-10 text-sm text-charcoal outline-none transition-all focus:shadow-card ${
            error
              ? "border-destructive focus:border-destructive"
              : valid
              ? "border-teal/60 focus:border-teal"
              : "border-input focus:border-teal"
          }`}
        />
        {valid && (
          <Check
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-teal animate-fade-up"
          />
        )}
      </div>
      <p className={`mt-1.5 text-xs ${error ? "text-destructive" : "text-charcoal/50"}`}>
        {error || hint || ""}
      </p>
    </div>
  );
}
