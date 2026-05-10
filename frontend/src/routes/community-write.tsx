import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  FileText,
  AlignLeft,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth-context";

// ── API Base ───────────────────────────────────────────────────────
const API_BASE =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000"
    : "http://localhost:3000";

// ── Route ──────────────────────────────────────────────────────────
export const Route = createFileRoute("/community-write")({
  head: () => ({
    meta: [
      { title: "Write a Post — Traveloop Community" },
      {
        name: "description",
        content: "Share your travel experience with the Traveloop community.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap",
      },
    ],
  }),
  component: CommunityWritePage,
});

// ── Component ──────────────────────────────────────────────────────
function CommunityWritePage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const charCount = body.length;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!accessToken) {
      setError("You must be logged in to post");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/community`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Failed to create post");
        return;
      }
      setSuccess(true);
      // Redirect to community after a brief success moment
      setTimeout(() => {
        navigate({ to: "/community" });
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not logged in ────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-2xl px-6">
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto w-20 h-20 rounded-2xl bg-muted grid place-items-center mb-6">
                <FileText size={36} className="text-charcoal/30" />
              </div>
              <h1 className="font-display font-bold text-charcoal text-2xl md:text-3xl">
                Sign in to share
              </h1>
              <p className="mt-3 text-charcoal/55 max-w-md mx-auto">
                You need to be logged in to share your travel experience with the community.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link to="/login">
                  <motion.span
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-6 py-3 font-medium shadow-card cursor-pointer"
                    whileHover={{ y: -2, boxShadow: "0 16px 36px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Sign in
                  </motion.span>
                </Link>
                <Link to="/community">
                  <motion.span
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card text-charcoal/70 px-6 py-3 font-medium cursor-pointer"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back to Community
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-2xl px-6">
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <motion.div
                className="mx-auto w-20 h-20 rounded-full bg-teal/10 grid place-items-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 400, delay: 0.1 }}
              >
                <Sparkles size={36} className="text-teal" />
              </motion.div>
              <h2 className="font-display font-bold text-charcoal text-2xl">
                Post published!
              </h2>
              <p className="mt-2 text-charcoal/55">
                Redirecting you back to the community…
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // ── Write form ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-6">
          {/* ── Back button ── */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/community">
              <motion.span
                className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-teal transition-colors cursor-pointer mb-8"
                whileHover={{ x: -3 }}
              >
                <ArrowLeft size={16} />
                Back to Community
              </motion.span>
            </Link>
          </motion.div>

          {/* ── Header ── */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal mb-3">
              <Sparkles size={14} />
              New Post
            </span>
            <h1 className="font-display font-bold text-charcoal text-3xl md:text-4xl tracking-tight">
              Share Your Experience
            </h1>
            <p className="mt-3 text-charcoal/55">
              Tell the community about a trip or activity — what you loved, tips for others,
              memorable moments.
            </p>
          </motion.div>

          {/* ── Form Card ── */}
          <motion.div
            className="rounded-3xl bg-card border border-border shadow-card p-6 md:p-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="write-title"
                  className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2"
                >
                  <FileText size={15} className="text-teal" />
                  Title <span className="text-coral">*</span>
                </label>
                <input
                  id="write-title"
                  type="text"
                  placeholder="e.g. My 10-day adventure across Japan"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base text-charcoal placeholder:text-charcoal/30 outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50 transition-all font-medium"
                  maxLength={400}
                  autoFocus
                />
                <p className="mt-1.5 text-xs text-charcoal/35 text-right">
                  {title.length}/400
                </p>
              </div>

              {/* Body */}
              <div>
                <label
                  htmlFor="write-body"
                  className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2"
                >
                  <AlignLeft size={15} className="text-teal" />
                  Description
                </label>
                <textarea
                  id="write-body"
                  placeholder="Write about your experience here...&#10;&#10;• What was your favorite part?&#10;• Any tips for future travelers?&#10;• Memorable moments to share?"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base text-charcoal placeholder:text-charcoal/30 outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50 transition-all resize-none leading-relaxed"
                />
                <p className="mt-1.5 text-xs text-charcoal/35 text-right">
                  {charCount} character{charCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  className="rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/60">
                <Link to="/community" className="flex-1">
                  <motion.span
                    className="block text-center rounded-xl border border-border bg-card text-charcoal/70 px-4 py-3.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.span>
                </Link>
                <motion.button
                  id="submit-post-btn"
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-primary text-primary-foreground px-4 py-3.5 text-sm font-medium shadow-card disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  whileHover={
                    !submitting && title.trim()
                      ? {
                          y: -2,
                          boxShadow:
                            "0 16px 36px -20px color-mix(in oklab, var(--primary) 45%, transparent)",
                        }
                      : {}
                  }
                  whileTap={!submitting && title.trim() ? { scale: 0.97 } : {}}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Publish Post
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── Posting as ── */}
          <motion.p
            className="mt-6 text-center text-xs text-charcoal/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Posting as{" "}
            <span className="font-medium text-charcoal/60">
              {user.first_name} {user.last_name}
            </span>
          </motion.p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
