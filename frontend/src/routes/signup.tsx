import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  User,
  Phone,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const signupSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "Must be 100 characters or less"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Must be 100 characters or less"),
  email: z.string().email("Please enter a valid email"),
  phone_number: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Must be 128 characters or less"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
];

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Traveloop" },
      {
        name: "description",
        content: "Sign up for a Traveloop account and start planning trips.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [firstName, setFirstName] = useState("");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
    },
  });

  const passwordValue = form.watch("password");

  const onSubmit = async (values: SignupFormValues) => {
    setError("");
    try {
      await signup({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone_number: values.phone_number?.trim() || undefined,
      });
      setFirstName(values.first_name.trim());
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  // ── Success State ──
  if (step === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-sm space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-teal" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">
              Welcome aboard, {firstName}!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account has been created successfully. Ready to start
              planning your first adventure?
            </p>
          </div>

          <Button
            size="lg"
            className="w-full h-11 font-semibold"
            onClick={() => navigate({ to: "/" })}
          >
            Start Exploring
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel: Travel visual ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/70 to-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/30" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-display font-semibold text-white">
              Traveloop
            </span>
          </Link>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md space-y-5"
          >
            <h2 className="text-4xl font-display font-bold tracking-tight text-white leading-tight">
              Your next adventure
              <br />
              <span className="text-primary">starts here.</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Join thousands of travelers who plan smarter, travel further, and
              share unforgettable experiences.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex gap-12"
          >
            {[
              { value: "50K+", label: "Travelers" },
              { value: "120+", label: "Countries" },
              { value: "1M+", label: "Trips Planned" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-display font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel: Signup form ──────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-display font-semibold">Traveloop</span>
            </Link>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-5 space-y-2">
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Start planning trips in under a minute
              </p>
            </CardHeader>

            <CardContent className="px-0">
              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-5 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="first_name"
                        placeholder="John"
                        autoComplete="given-name"
                        autoFocus
                        className={cn(
                          "pl-10 h-11",
                          form.formState.errors.first_name &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...form.register("first_name")}
                      />
                    </div>
                    {form.formState.errors.first_name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                      id="last_name"
                      placeholder="Doe"
                      autoComplete="family-name"
                      className={cn(
                        "h-11",
                        form.formState.errors.last_name &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      {...form.register("last_name")}
                    />
                    {form.formState.errors.last_name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={cn(
                        "pl-10 h-11",
                        form.formState.errors.email &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      autoComplete="tel"
                      className="pl-10 h-11"
                      {...form.register("phone_number")}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className={cn(
                        "pl-10 pr-10 h-11",
                        form.formState.errors.password &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Password strength indicators */}
                {passwordValue && passwordValue.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1.5"
                  >
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(passwordValue);
                      return (
                        <div
                          key={rule.label}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                              passed
                                ? "bg-teal/20 text-teal"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {passed && <Check className="w-3 h-3" />}
                          </div>
                          <span
                            className={cn(
                              passed ? "text-teal" : "text-muted-foreground"
                            )}
                          >
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                <div className="pt-1">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-11 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </div>
              </form>

              {/* Terms */}
              <p className="mt-5 text-center text-xs text-muted-foreground leading-relaxed">
                By creating an account, you agree to our{" "}
                <span className="text-foreground/70 hover:text-primary cursor-pointer transition-colors">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-foreground/70 hover:text-primary cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </p>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
