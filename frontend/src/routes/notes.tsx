import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StickyNote, Plus, ChevronDown, Search, Trash2, Pin, PinOff,
  Pencil, X, Save, Clock, MapPin,
} from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useAuth, API_BASE } from "@/lib/auth-context";

// ── Types 
interface Note {
  id: string;
  trip_id: string;
  trip_stop_id: string | null;
  title: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  stop_city_name?: string;
}

interface Trip {
  id: string;
  title: string;
  trip_status: string;
}

type FilterMode = "all" | "pinned";

// Route 
export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Trip Notes — Traveloop" },
      { name: "description", content: "Jot down travel notes, reminders, and important details." },
    ],
  }),
  component: NotesPage,
});

// ── Page ───────────────────────────────────────────────────────────
function NotesPage() {
  const { user, accessToken, isInitialized } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  // Add/edit state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

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

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!accessToken || !selectedTripId) return;
    try {
      const res = await fetch(`${API_BASE}/api/notes/${selectedTripId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data) setNotes(json.data.notes || []);
    } catch {}
  }, [accessToken, selectedTripId]);

  useEffect(() => {
    if (selectedTripId) fetchNotes();
  }, [selectedTripId, fetchNotes]);

  // Add note
  const handleSave = async () => {
    if (!accessToken || !selectedTripId || !formContent.trim()) return;
    try {
      if (editingId) {
        // Update
        await fetch(`${API_BASE}/api/notes/${editingId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: formTitle.trim() || undefined, content: formContent.trim() }),
        });
      } else {
        // Create
        await fetch(`${API_BASE}/api/notes/${selectedTripId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: formTitle.trim() || undefined, content: formContent.trim() }),
        });
      }
      setFormTitle("");
      setFormContent("");
      setShowForm(false);
      setEditingId(null);
      fetchNotes();
    } catch {}
  };

  // Delete
  const handleDelete = async (noteId: string) => {
    if (!accessToken) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await fetch(`${API_BASE}/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
    } catch { fetchNotes(); }
  };

  // Pin toggle
  const handleTogglePin = async (noteId: string) => {
    if (!accessToken) return;
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, is_pinned: !n.is_pinned } : n)));
    try {
      await fetch(`${API_BASE}/api/notes/${noteId}/pin`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
    } catch { fetchNotes(); }
  };

  // Edit
  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setFormTitle(note.title || "");
    setFormContent(note.content);
    setShowForm(true);
  };

  // Filter + search
  const filtered = notes
    .filter((n) => filter === "all" || n.is_pinned)
    .filter((n) =>
      (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  // Loading / unauth states
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-28 pb-20 max-w-3xl mx-auto px-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-12 bg-muted rounded" />
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
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
          <StickyNote size={48} className="mx-auto text-charcoal/20 mb-4" />
          <h2 className="font-display font-bold text-2xl text-charcoal">Sign in to access your trip notes</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="pt-24 pb-20 max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">Journal</span>
          <h1 className="mt-1 font-display font-bold text-3xl text-charcoal tracking-tight">Trip Notes</h1>
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

        {/* Search + Filter */}
        <motion.div
          className="mt-4 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/35" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border/70 bg-card pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 shadow-card focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div className="flex gap-1.5 bg-muted/50 rounded-xl p-1 border border-border/50">
            {(["all", "pinned"] as FilterMode[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === f
                    ? "bg-card text-charcoal shadow-sm"
                    : "text-charcoal/50 hover:text-charcoal/70"
                }`}
              >
                {f === "all" ? "All" : "📌 Pinned"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Add Note Button */}
        <motion.div className="mt-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormTitle(""); setFormContent(""); }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-card cursor-pointer"
            whileHover={{ y: -2, boxShadow: "0 12px 28px -12px color-mix(in oklab, var(--primary) 40%, transparent)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Add Note
          </motion.button>
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="mt-4 rounded-2xl bg-card border border-border/70 shadow-card p-5"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm text-charcoal">
                  {editingId ? "Edit Note" : "New Note"}
                </h3>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-charcoal/40 hover:text-charcoal cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Title (optional)"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-teal/30 mb-3"
              />
              <textarea
                placeholder="Write your note..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-teal/30 resize-none"
              />
              <motion.button
                onClick={handleSave}
                disabled={!formContent.trim()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal text-white px-5 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={14} /> {editingId ? "Update" : "Save Note"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes List */}
        <div className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-2xl border shadow-card p-5 group transition-colors ${
                  note.is_pinned
                    ? "bg-amber-50/50 border-amber-200/70"
                    : "bg-card border-border/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {note.title && (
                      <h3 className="font-display font-semibold text-charcoal text-[15px] leading-snug">{note.title}</h3>
                    )}
                    <p className="mt-1.5 text-sm text-charcoal/70 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-charcoal/40">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {formatDate(note.updated_at)}
                      </span>
                      {note.stop_city_name && (
                        <span className="inline-flex items-center gap-1 text-teal">
                          <MapPin size={11} /> {note.stop_city_name} stop
                        </span>
                      )}
                      {note.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">📌 Pinned</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => handleTogglePin(note.id)} className="p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer text-charcoal/40 hover:text-amber-600" title={note.is_pinned ? "Unpin" : "Pin"}>
                      {note.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button onClick={() => startEdit(note)} className="p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer text-charcoal/40 hover:text-teal" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer text-charcoal/40 hover:text-destructive" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && !loading && (
          <motion.div
            className="mt-8 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <StickyNote size={40} className="mx-auto text-charcoal/20 mb-3" />
            <h3 className="font-display font-semibold text-charcoal">
              {filter === "pinned" ? "No pinned notes" : "No notes yet"}
            </h3>
            <p className="mt-1 text-sm text-charcoal/50">
              {filter === "pinned" ? "Pin important notes for quick access." : "Add your first note above."}
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
