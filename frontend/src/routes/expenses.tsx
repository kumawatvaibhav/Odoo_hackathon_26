import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronDown, Download, FileText, CheckCircle2,
  Receipt, TrendingUp, PieChart, Plus, Trash2,
} from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth, API_BASE } from "@/lib/auth-context";

// ── Types ──────────────────────────────────────────────────────────
interface Expense {
  id: string;
  category: string;
  title: string;
  description: string | null;
  amount: string;
  quantity: number;
  currency: string;
  expense_date: string;
  is_paid: boolean;
}

interface BudgetSummary {
  total_budget: number | null;
  total_spent: number;
  currency: string;
}

interface Trip {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  trip_status: string;
  cover_image_url: string | null;
  destination_name: string | null;
  destination_country: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  transport: "Transport",
  stay: "Hotel / Stay",
  food: "Food & Drink",
  activity: "Activity",
  shopping: "Shopping",
  insurance: "Insurance",
  visa: "Visa / Docs",
  misc: "Miscellaneous",
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: "bg-blue-100 text-blue-700",
  stay: "bg-purple-100 text-purple-700",
  food: "bg-amber-100 text-amber-700",
  activity: "bg-teal/10 text-teal",
  shopping: "bg-pink-100 text-pink-700",
  insurance: "bg-slate-100 text-slate-700",
  visa: "bg-indigo-100 text-indigo-700",
  misc: "bg-gray-100 text-gray-600",
};

// ── Route ──────────────────────────────────────────────────────────
export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expense Invoice — Traveloop" },
      { name: "description", content: "View and manage your trip expenses and invoices." },
    ],
  }),
  component: ExpensesPage,
});

// ── Donut Chart ────────────────────────────────────────────────────
function DonutChart({ budget, spent }: { budget: number; spent: number }) {
  const remaining = Math.max(budget - spent, 0);
  const spentPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (spentPct / 100) * circumference;
  const isOver = spent > budget;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <motion.circle
          cx="50" cy="50" r="42" fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={isOver ? "text-destructive" : "text-teal"}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-charcoal">{Math.round(spentPct)}%</span>
        <span className="text-[10px] text-charcoal/50">used</span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────
function ExpensesPage() {
  const { user, accessToken, isInitialized } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({ total_budget: null, total_spent: 0, currency: "USD" });
  const [loading, setLoading] = useState(true);

  // Add expense form
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("misc");
  const [newAmount, setNewAmount] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newDesc, setNewDesc] = useState("");

  // Fetch trips
  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/api/trips/my`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const all = [...(json.data.preplanned || []), ...(json.data.completed || [])];
          setTrips(all);
          if (all.length > 0) setSelectedTripId(all[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    if (!accessToken || !selectedTripId) return;
    try {
      const res = await fetch(`${API_BASE}/api/expenses/${selectedTripId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setExpenses(json.data.expenses || []);
        setSummary(json.data.summary || { total_budget: null, total_spent: 0, currency: "USD" });
      }
    } catch {}
  }, [accessToken, selectedTripId]);

  useEffect(() => {
    if (selectedTripId) fetchExpenses();
  }, [selectedTripId, fetchExpenses]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  // Add expense
  const handleAdd = async () => {
    if (!accessToken || !selectedTripId || !newTitle.trim() || !newAmount) return;
    try {
      await fetch(`${API_BASE}/api/expenses/${selectedTripId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          amount: parseFloat(newAmount),
          quantity: parseInt(newQty) || 1,
          description: newDesc.trim() || undefined,
        }),
      });
      setNewTitle(""); setNewAmount(""); setNewQty("1"); setNewDesc(""); setShowAdd(false);
      fetchExpenses();
    } catch {}
  };

  // Delete expense
  const handleDelete = async (expenseId: string) => {
    if (!accessToken) return;
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    try {
      await fetch(`${API_BASE}/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      fetchExpenses();
    } catch { fetchExpenses(); }
  };

  // Mark paid
  const handleMarkPaid = async (expenseId: string) => {
    if (!accessToken) return;
    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, is_paid: true } : e)));
    try {
      await fetch(`${API_BASE}/api/expenses/${expenseId}/paid`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
    } catch { fetchExpenses(); }
  };

  // Calculations
  const subtotal = expenses.reduce((s, e) => s + parseFloat(e.amount) * e.quantity, 0);
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;
  const allPaid = expenses.length > 0 && expenses.every((e) => e.is_paid);
  const invoiceId = selectedTripId ? `INV-TL-${selectedTripId.slice(0, 6).toUpperCase()}` : "—";

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-28 pb-20 max-w-6xl mx-auto px-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-40 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 pb-20 text-center px-6">
          <Receipt size={48} className="mx-auto text-charcoal/20 mb-4" />
          <h2 className="font-display font-bold text-2xl text-charcoal">Sign in to view expenses</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-charcoal/50 hover:text-teal transition-colors mb-4">
            <ArrowLeft size={14} /> Back to My Trips
          </Link>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">Billing</span>
          <h1 className="mt-1 font-display font-bold text-3xl text-charcoal tracking-tight">Expense Invoice</h1>
        </motion.div>

        {/* Trip Selector */}
        <motion.div className="mt-6 relative" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <select
            value={selectedTripId || ""}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="w-full sm:w-80 appearance-none rounded-xl border border-border/70 bg-card px-4 py-3 pr-10 text-sm font-medium text-charcoal shadow-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30"
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 sm:left-[17rem] top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Left Column: Trip Info + Table */}
          <div className="space-y-6">
            {/* Trip Info Card */}
            {selectedTrip && (
              <motion.div
                className="rounded-2xl bg-card border border-border/70 shadow-card p-5 flex flex-col sm:flex-row gap-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {selectedTrip.cover_image_url && (
                  <img
                    src={selectedTrip.cover_image_url}
                    alt={selectedTrip.title}
                    className="w-full sm:w-32 h-24 object-cover rounded-xl"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-bold text-lg text-charcoal">{selectedTrip.title}</h2>
                  <p className="text-xs text-charcoal/50 mt-1">
                    {selectedTrip.start_date && selectedTrip.end_date
                      ? `${new Date(selectedTrip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date(selectedTrip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : "Dates TBD"
                    }
                    {selectedTrip.destination_name && ` · ${selectedTrip.destination_name}`}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-charcoal/60">
                    <span><span className="font-semibold text-charcoal/80">Invoice ID:</span> {invoiceId}</span>
                    <span><span className="font-semibold text-charcoal/80">Generated:</span> {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span><span className="font-semibold text-charcoal/80">Status:</span>{" "}
                      <span className={`font-semibold ${allPaid ? "text-teal" : "text-amber-600"}`}>
                        {allPaid ? "Paid" : "Pending"}
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Expense Table */}
            <motion.div
              className="rounded-2xl bg-card border border-border/70 shadow-card overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-charcoal/70 w-10">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-charcoal/70">Category</th>
                      <th className="text-left px-4 py-3 font-semibold text-charcoal/70">Description</th>
                      <th className="text-right px-4 py-3 font-semibold text-charcoal/70">Qty</th>
                      <th className="text-right px-4 py-3 font-semibold text-charcoal/70">Unit Cost</th>
                      <th className="text-right px-4 py-3 font-semibold text-charcoal/70">Amount</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp, i) => (
                      <tr key={exp.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3 text-charcoal/40 font-medium">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_COLORS[exp.category] || "bg-gray-100 text-gray-600"}`}>
                            {CATEGORY_LABELS[exp.category] || exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-charcoal">{exp.title}</p>
                          {exp.description && <p className="text-xs text-charcoal/45 mt-0.5">{exp.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-right text-charcoal/70">{exp.quantity}</td>
                        <td className="px-4 py-3 text-right text-charcoal/70">
                          {summary.currency === "USD" ? "$" : summary.currency}{parseFloat(exp.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-charcoal">
                          {summary.currency === "USD" ? "$" : summary.currency}{(parseFloat(exp.amount) * exp.quantity).toLocaleString()}
                        </td>
                        <td className="px-2 py-3">
                          <button onClick={() => handleDelete(exp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal/30 hover:text-destructive cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-charcoal/40">
                          <Receipt size={32} className="mx-auto mb-2 text-charcoal/20" />
                          No expenses recorded for this trip.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Row */}
              {expenses.length > 0 && (
                <div className="border-t border-border/60 px-4 py-4 bg-muted/20">
                  <div className="flex flex-col items-end gap-1.5 text-sm">
                    <div className="flex gap-8">
                      <span className="text-charcoal/60">Subtotal</span>
                      <span className="font-medium text-charcoal w-24 text-right">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-charcoal/60">Tax (5%)</span>
                      <span className="font-medium text-charcoal w-24 text-right">${tax.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex gap-8 pt-2 border-t border-border/50 mt-1">
                      <span className="font-bold text-charcoal">Grand Total</span>
                      <span className="font-bold text-charcoal text-lg w-24 text-right">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <motion.button
                onClick={() => setShowAdd(!showAdd)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card cursor-pointer"
                whileHover={{ y: -2, boxShadow: "0 12px 28px -12px color-mix(in oklab, var(--primary) 40%, transparent)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Add Expense
              </motion.button>
              <motion.button
                className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-5 py-2.5 text-sm font-medium text-charcoal shadow-card cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.print()}
              >
                <Download size={14} /> Download Invoice
              </motion.button>
              <motion.button
                className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-5 py-2.5 text-sm font-medium text-charcoal shadow-card cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.print()}
              >
                <FileText size={14} /> Export as PDF
              </motion.button>
              {!allPaid && expenses.length > 0 && (
                <motion.button
                  onClick={() => expenses.forEach((e) => !e.is_paid && handleMarkPaid(e.id))}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal text-white px-5 py-2.5 text-sm font-semibold shadow-card cursor-pointer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle2 size={14} /> Mark as Paid
                </motion.button>
              )}
            </motion.div>

            {/* Add Expense Form */}
            {showAdd && (
              <motion.div
                className="rounded-2xl bg-card border border-border/70 shadow-card p-5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Expense title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-teal/30" />
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                    className="rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm text-charcoal cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <input type="number" placeholder="Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
                    className="rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-teal/30" />
                  <input type="number" placeholder="Quantity" value={newQty} onChange={(e) => setNewQty(e.target.value)}
                    className="rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-teal/30" />
                  <input type="text" placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                    className="rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-teal/30 sm:col-span-2" />
                </div>
                <motion.button onClick={handleAdd}
                  className="mt-3 rounded-xl bg-teal text-white px-5 py-2.5 text-sm font-semibold cursor-pointer"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  Add Expense
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Right Column: Budget Insights */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="rounded-2xl bg-card border border-border/70 shadow-card p-5">
              <h3 className="font-display font-semibold text-sm text-charcoal flex items-center gap-2">
                <PieChart size={16} className="text-teal" /> Budget Insights
              </h3>

              {summary.total_budget != null ? (
                <>
                  <div className="mt-4">
                    <DonutChart budget={summary.total_budget} spent={summary.total_spent} />
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Total Budget</span>
                      <span className="font-bold text-charcoal">${summary.total_budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Total Spent</span>
                      <span className="font-bold text-coral">${summary.total_spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/50">
                      <span className="text-charcoal/60">Remaining</span>
                      <span className={`font-bold ${summary.total_budget - summary.total_spent >= 0 ? "text-teal" : "text-destructive"}`}>
                        ${(summary.total_budget - summary.total_spent).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 text-center py-6">
                  <TrendingUp size={28} className="mx-auto text-charcoal/20 mb-2" />
                  <p className="text-xs text-charcoal/45">No budget set for this trip.</p>
                </div>
              )}

              <Link to="/profile">
                <motion.span
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-background px-4 py-2 text-xs font-medium text-charcoal cursor-pointer"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Full Budget →
                </motion.span>
              </Link>
            </div>

            {/* Payment Status */}
            <div className="rounded-2xl bg-card border border-border/70 shadow-card p-5">
              <h3 className="font-display font-semibold text-sm text-charcoal mb-3">Payment Status</h3>
              <div className="space-y-2">
                {expenses.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between text-xs">
                    <span className="text-charcoal/70 truncate max-w-[140px]">{exp.title}</span>
                    {exp.is_paid ? (
                      <span className="inline-flex items-center gap-1 text-teal font-semibold">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(exp.id)}
                        className="text-amber-600 font-semibold hover:text-teal transition-colors cursor-pointer"
                      >
                        Pending
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
