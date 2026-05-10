import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Check, Plus, RotateCcw, ChevronDown,
  Shirt, FileText, Smartphone, Droplets, Gem, Search, Trash2,
} from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth, API_BASE } from "@/lib/auth-context";

// ── Types ──────────────────────────────────────────────────────────
interface PackingItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  is_packed: boolean;
}

interface Trip {
  id: string;
  title: string;
  trip_status: string;
}

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  documents:   { icon: FileText,   color: "text-blue-500",   label: "Documents" },
  clothing:    { icon: Shirt,      color: "text-purple-500", label: "Clothing" },
  electronics: { icon: Smartphone, color: "text-amber-500",  label: "Electronics" },
  toiletries:  { icon: Droplets,   color: "text-cyan-500",   label: "Toiletries" },
  accessories: { icon: Gem,        color: "text-pink-500",   label: "Accessories" },
};

function getCategoryMeta(cat: string | null) {
  return CATEGORY_META[cat || ""] || { icon: Package, color: "text-charcoal/50", label: cat || "Other" };
}

// ── Route ──────────────────────────────────────────────────────────
export const Route = createFileRoute("/packing")({
  head: () => ({
    meta: [
      { title: "Packing Checklist — Traveloop" },
      { name: "description", content: "Manage your trip packing checklist." },
    ],
  }),
  component: PackingPage,
});

// ── Page ───────────────────────────────────────────────────────────
function PackingPage() {
  const { user, accessToken, isInitialized } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("clothing");
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch user's trips
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

  // Fetch packing items for selected trip
  const fetchItems = useCallback(async () => {
    if (!accessToken || !selectedTripId) return;
    try {
      const res = await fetch(`${API_BASE}/api/packing/${selectedTripId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.items || []);
      }
    } catch {}
  }, [accessToken, selectedTripId]);

  useEffect(() => {
    if (selectedTripId) fetchItems();
  }, [selectedTripId, fetchItems]);

  // Toggle item
  const handleToggle = async (itemId: string) => {
    if (!accessToken) return;
    // Optimistic update
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, is_packed: !it.is_packed } : it)));
    try {
      await fetch(`${API_BASE}/api/packing/${itemId}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
    } catch {
      fetchItems(); // revert on error
    }
  };

  // Add item
  const handleAdd = async () => {
    if (!accessToken || !selectedTripId || !newItemName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/packing/${selectedTripId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newItemName.trim(), category: newItemCategory }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setItems((prev) => [...prev, json.data.item]);
        setNewItemName("");
        setShowAddForm(false);
      }
    } catch {}
  };

  // Delete item
  const handleDelete = async (itemId: string) => {
    if (!accessToken) return;
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    try {
      await fetch(`${API_BASE}/api/packing/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
    } catch { fetchItems(); }
  };

  // Reset all
  const handleReset = async () => {
    if (!accessToken || !selectedTripId) return;
    setItems((prev) => prev.map((it) => ({ ...it, is_packed: false })));
    try {
      await fetch(`${API_BASE}/api/packing/${selectedTripId}/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
    } catch { fetchItems(); }
  };

  // Group by category
  const filteredItems = items.filter((it) =>
    it.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const grouped = filteredItems.reduce<Record<string, PackingItem[]>>((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const packedItems = items.filter((it) => it.is_packed).length;
  const progressPct = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-28 pb-20 max-w-3xl mx-auto px-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-48" />
            <div className="h-3 bg-muted rounded-full" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-xl" />
            ))}
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
          <Package size={48} className="mx-auto text-charcoal/20 mb-4" />
          <h2 className="font-display font-bold text-2xl text-charcoal">Sign in to access your packing checklists</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="pt-24 pb-20 max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">Organize</span>
          <h1 className="mt-1 font-display font-bold text-3xl text-charcoal tracking-tight">Packing Checklist</h1>
        </motion.div>

        {/* Trip Selector */}
        <motion.div
          className="mt-6 relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="relative">
            <select
              value={selectedTripId || ""}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full sm:w-80 appearance-none rounded-xl border border-border/70 bg-card px-4 py-3 pr-10 text-sm font-medium text-charcoal shadow-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="mt-4 relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-card pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 shadow-card focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </motion.div>

        {/* Progress */}
        <motion.div
          className="mt-6 rounded-2xl bg-card border border-border/70 shadow-card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-charcoal">
              Progress: <span className="text-teal font-bold">{packedItems}/{totalItems}</span> items packed
            </p>
            <span className="text-xs text-charcoal/50 font-medium">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Category Groups */}
        <div className="mt-6 space-y-4">
          {Object.entries(grouped).map(([cat, catItems], gi) => {
            const meta = getCategoryMeta(cat);
            const CatIcon = meta.icon;
            const catPacked = catItems.filter((it) => it.is_packed).length;

            return (
              <motion.div
                key={cat}
                className="rounded-2xl bg-card border border-border/70 shadow-card overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + gi * 0.05, duration: 0.5 }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <CatIcon size={16} className={meta.color} />
                    <span className="text-sm font-semibold text-charcoal">{meta.label}</span>
                  </div>
                  <span className="text-xs font-medium text-charcoal/50 bg-muted px-2.5 py-1 rounded-full">
                    {catPacked}/{catItems.length}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-border/40">
                  <AnimatePresence mode="popLayout">
                    {catItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        className="flex items-center gap-3 px-5 py-3 group"
                      >
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            item.is_packed
                              ? "bg-teal border-teal text-white"
                              : "border-charcoal/25 hover:border-teal/50"
                          }`}
                        >
                          {item.is_packed && <Check size={12} strokeWidth={3} />}
                        </button>
                        <span
                          className={`flex-1 text-sm transition-all ${
                            item.is_packed ? "line-through text-charcoal/35" : "text-charcoal"
                          }`}
                        >
                          {item.name}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal/30 hover:text-destructive cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {totalItems === 0 && !loading && (
          <motion.div
            className="mt-8 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Package size={40} className="mx-auto text-charcoal/20 mb-3" />
            <h3 className="font-display font-semibold text-charcoal">No items yet</h3>
            <p className="mt-1 text-sm text-charcoal/50">Add items to your packing checklist below.</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="mt-6 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card cursor-pointer"
            whileHover={{ y: -2, boxShadow: "0 12px 28px -12px color-mix(in oklab, var(--primary) 40%, transparent)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Add Item
          </motion.button>
          <motion.button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-5 py-2.5 text-sm font-medium text-charcoal shadow-card cursor-pointer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={14} /> Reset All
          </motion.button>
        </motion.div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="mt-4 rounded-2xl bg-card border border-border/70 shadow-card p-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Item name..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="flex-1 rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-teal/30"
                  autoFocus
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm text-charcoal cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30"
                >
                  <option value="documents">Documents</option>
                  <option value="clothing">Clothing</option>
                  <option value="electronics">Electronics</option>
                  <option value="toiletries">Toiletries</option>
                  <option value="accessories">Accessories</option>
                </select>
                <motion.button
                  onClick={handleAdd}
                  className="rounded-xl bg-teal text-white px-5 py-2.5 text-sm font-semibold cursor-pointer"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
