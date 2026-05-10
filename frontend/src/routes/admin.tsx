import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MapPin, Activity, TrendingUp, Loader2, Lock, BarChart3,
  Plus, Trash2, Edit3, X, Star, RotateCcw, Search, Shield,
} from "lucide-react";

const API = (typeof window !== "undefined"
  ? (import.meta.env.VITE_API_URL as string | undefined) : null) || "http://localhost:3000";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Traveloop" }] }),
  component: AdminPage,
});

type Tab = "users" | "cities" | "activities" | "posts";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "users", label: "Manage Users", icon: Users },
  { id: "cities", label: "Cities", icon: MapPin },
  { id: "activities", label: "Activities", icon: Activity },
  { id: "posts", label: "Community Posts", icon:BarChart3 },
];

function AdminPage() {
  const [authed, setAuthed] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("admin_auth") === "true" : false
  );
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState(""); const [logging, setLogging] = useState(false);
  const [tab, setTab] = useState<Tab>("users");
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "add"|"edit"; entity: string; item?: any } | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [citiesList, setCitiesList] = useState<any[]>([]);

  const login = async () => {
    if (!email || !pw) { setLoginErr("Both fields required"); return; }
    setLogging(true); setLoginErr("");
    try {
      const r = await fetch(`${API}/api/admin/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) { setLoginErr(j.message || "Invalid"); return; }
      sessionStorage.setItem("admin_auth", "true"); setAuthed(true);
    } catch { setLoginErr("Network error"); } finally { setLogging(false); }
  };

  const fetchTab = useCallback(async () => {
    setLoading(true);
    try {
      const urls: Record<Tab, string> = {
        users: `${API}/api/admin/users?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`,
        cities: `${API}/api/admin/cities`,
        activities: `${API}/api/admin/activities`,
        posts: `${API}/api/admin/posts`,
      };
      const r = await fetch(urls[tab]); const j = await r.json();
      if (j.success) setData(j.data);
    } catch {} finally { setLoading(false); }
  }, [tab, search]);

  const fetchTrends = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/admin/stats/trends`);
      const j = await r.json(); if (j.success) setTrends(j.data);
    } catch {}
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/admin/cities`);
      const j = await r.json();
      if (j.success && j.data?.cities) setCitiesList(j.data.cities);
    } catch {}
  }, []);

  useEffect(() => { if (authed) { fetchTab(); fetchTrends(); fetchCities(); } }, [authed, fetchTab, fetchTrends, fetchCities]);

  const doAction = async (method: string, url: string, body?: any) => {
    setSaving(true);
    try {
      await fetch(url, { method, headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}) });
      setModal(null); setForm({}); fetchTab(); fetchTrends(); fetchCities();
    } catch {} finally { setSaving(false); }
  };

  const openAdd = (entity: string) => { setForm({}); setModal({ type: "add", entity }); };
  const openEdit = (entity: string, item: any) => { setForm({ ...item }); setModal({ type: "edit", entity, item }); };

  // ── Login ──
  if (!authed) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-primary grid place-items-center mb-4">
            <Lock size={24} className="text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-charcoal text-2xl">Admin Panel</h1>
          <p className="text-sm text-charcoal/50 mt-1">Traveloop Administration</p>
        </div>
        <div className="rounded-2xl bg-card border border-border shadow-card p-6 space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@odoo.com" onKeyDown={e => e.key === "Enter" && login()}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30" />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Password" onKeyDown={e => e.key === "Enter" && login()}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30" />
          {loginErr && <p className="text-sm text-destructive">{loginErr}</p>}
          <motion.button onClick={login} disabled={logging}
            className="w-full rounded-xl bg-gradient-primary text-primary-foreground py-3 font-medium shadow-card cursor-pointer disabled:opacity-50"
            whileTap={{ scale: 0.98 }}>{logging ? "Signing in…" : "Sign In"}</motion.button>
        </div>
      </motion.div>
    </div>
  );

  // ── Dashboard ──
  const s = trends?.summary || {};
  const stats = [
    { label: "Users", val: s.total_users || 0, icon: Users, c: "text-teal" },
    { label: "Trips", val: s.total_trips || 0, icon: MapPin, c: "text-coral" },
    { label: "Posts", val: s.total_posts || 0, icon: BarChart3, c: "text-gold" },
    { label: "Cities", val: s.total_cities || 0, icon: Shield, c: "text-primary" },
  ];
  const regs = trends?.registrations || [];
  const maxR = Math.max(1, ...regs.map((r: any) => Number(r.count)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <div className="px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-sm">TL</span>
            <span className="font-display font-semibold text-charcoal">Traveloop</span>
            <span className="text-xs bg-teal/10 text-teal font-semibold rounded-full px-2 py-0.5 ml-1">Admin</span>
          </div>
          <button onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }}
            className="text-xs text-charcoal/50 hover:text-destructive cursor-pointer">Sign out</button>
        </div>
      </header>

      <div className="px-6 py-5 flex gap-6">
        {/* ── LEFT: Tabs + Content ── */}
        <div className="flex-[7] min-w-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal/30" />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border cursor-pointer transition-all ${
                  tab === t.id ? "border-teal/40 bg-teal/5 text-teal" : "border-border bg-card text-charcoal/60 hover:border-charcoal/30"
                }`}><t.icon size={14} />{t.label}</button>
            ))}
          </div>

          {/* Add button for cities/activities */}
          {(tab === "cities" || tab === "activities") && (
            <div className="flex justify-end mb-4">
              <motion.button onClick={() => openAdd(tab === "cities" ? "city" : "activity")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-card cursor-pointer"
                whileTap={{ scale: 0.97 }}><Plus size={14} />Add {tab === "cities" ? "City" : "Activity"}</motion.button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="text-teal animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {tab === "users" && <UsersTable data={data} />}
                {tab === "cities" && <CitiesTable data={data} onEdit={(c: any) => openEdit("city", c)}
                  onDelete={(id: string) => doAction("DELETE", `${API}/api/admin/cities/${id}`)} />}
                {tab === "activities" && <ActivitiesTable data={data} onEdit={(a: any) => openEdit("activity", a)}
                  onDelete={(id: string) => doAction("DELETE", `${API}/api/admin/activities/${id}`)} />}
                {tab === "posts" && <PostsTable data={data}
                  onDelete={(id: string) => doAction("DELETE", `${API}/api/admin/posts/${id}`)}
                  onRestore={(id: string) => doAction("POST", `${API}/api/admin/posts/${id}/restore`)}
                  onFeature={(id: string) => doAction("POST", `${API}/api/admin/posts/${id}/feature`)} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ── RIGHT: Analytics ── */}
        {/* ── RIGHT: Analytics (30%) ── */}
        <div className="hidden lg:flex flex-[3] flex-col gap-3">
          <h3 className="font-display font-semibold text-charcoal text-xs uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} className="text-teal" /> Analytics
          </h3>

          {/* Stat cards — 1 per row */}
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center gap-3">
              <div className="grid place-items-center w-9 h-9 rounded-lg bg-muted">
                <s.icon size={16} className={s.c} />
              </div>
              <div>
                <p className="font-display font-bold text-charcoal text-lg leading-none">{s.val.toLocaleString()}</p>
                <p className="text-xs text-charcoal/45 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}

          {/* Registrations chart */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs font-semibold text-charcoal/60 mb-3">Registrations (12mo)</p>
            {regs.length === 0 ? <p className="text-xs text-charcoal/40">No data</p> : (
              <div className="flex items-end gap-1 h-24">
                {regs.map((r: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className="text-[8px] text-charcoal/50">{r.count}</span>
                    <motion.div className="w-full rounded-t bg-gradient-primary min-h-[2px]"
                      initial={{ height: 0 }} animate={{ height: `${(Number(r.count) / maxR) * 100}%` }}
                      transition={{ duration: 0.4, delay: i * 0.03 }} />
                    <span className="text-[7px] text-charcoal/35">{r.month?.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(null)} />
            <motion.div className="fixed z-50 top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="rounded-2xl bg-card border border-border shadow-elegant p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-charcoal text-lg">
                    {modal.type === "add" ? "Add" : "Edit"} {modal.entity}
                  </h2>
                  <button onClick={() => setModal(null)} className="text-charcoal/40 hover:text-charcoal cursor-pointer"><X size={18} /></button>
                </div>
                {modal.entity === "city" && <CityForm form={form} setForm={setForm} />}
                {modal.entity === "activity" && <ActivityForm form={form} setForm={setForm} cities={citiesList} />}
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setModal(null)} className="flex-1 rounded-xl border border-border py-2.5 text-sm cursor-pointer hover:bg-muted">Cancel</button>
                  <motion.button disabled={saving} onClick={() => {
                    if (modal.entity === "city") {
                      if (modal.type === "add") doAction("POST", `${API}/api/admin/cities`, form);
                      else doAction("PUT", `${API}/api/admin/cities/${modal.item.id}`, form);
                    } else {
                      if (modal.type === "add") doAction("POST", `${API}/api/admin/activities`, form);
                      else doAction("PUT", `${API}/api/admin/activities/${modal.item.id}`, form);
                    }
                  }} className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground py-2.5 text-sm font-medium shadow-card cursor-pointer disabled:opacity-50"
                    whileTap={{ scale: 0.97 }}>{saving ? "Saving…" : "Save"}</motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Form Components ──
const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal/30 mb-3";

function CityForm({ form, setForm }: { form: any; setForm: any }) {
  const u = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  return (<div>
    <label className="text-xs font-medium text-charcoal/60">Name *</label>
    <input className={inp} value={form.name || ""} onChange={e => u("name", e.target.value)} />
    <label className="text-xs font-medium text-charcoal/60">Country *</label>
    <input className={inp} value={form.country || ""} onChange={e => u("country", e.target.value)} />
    <label className="text-xs font-medium text-charcoal/60">Country Code *</label>
    <input className={inp} maxLength={2} value={form.country_code || ""} onChange={e => u("country_code", e.target.value.toUpperCase())} />
    <div className="grid grid-cols-2 gap-2">
      <div><label className="text-xs font-medium text-charcoal/60">Latitude</label>
        <input className={inp} type="number" value={form.latitude ?? ""} onChange={e => u("latitude", Number(e.target.value))} /></div>
      <div><label className="text-xs font-medium text-charcoal/60">Longitude</label>
        <input className={inp} type="number" value={form.longitude ?? ""} onChange={e => u("longitude", Number(e.target.value))} /></div>
    </div>
  </div>);
}

function ActivityForm({ form, setForm, cities }: { form: any; setForm: any; cities: any[] }) {
  const u = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const cats = ["sightseeing","adventure","food_and_drink","nightlife","shopping","culture","relaxation","transport","accommodation","other"];
  return (<div>
    <label className="text-xs font-medium text-charcoal/60">Name *</label>
    <input className={inp} value={form.name || ""} onChange={e => u("name", e.target.value)} />
    <label className="text-xs font-medium text-charcoal/60">City *</label>
    <select className={inp} value={form.city_id || ""} onChange={e => u("city_id", e.target.value)}>
      <option value="">— Select a city —</option>
      {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
    </select>
    <label className="text-xs font-medium text-charcoal/60">Category</label>
    <select className={inp} value={form.category || "other"} onChange={e => u("category", e.target.value)}>
      {cats.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
    </select>
    <div className="grid grid-cols-2 gap-2">
      <div><label className="text-xs font-medium text-charcoal/60">Cost</label>
        <input className={inp} type="number" value={form.estimated_cost ?? ""} onChange={e => u("estimated_cost", Number(e.target.value))} /></div>
      <div><label className="text-xs font-medium text-charcoal/60">Duration (min)</label>
        <input className={inp} type="number" value={form.duration_minutes ?? ""} onChange={e => u("duration_minutes", Number(e.target.value))} /></div>
    </div>
  </div>);
}

// ── Table Components ──
const th = "px-4 py-2 text-left text-charcoal/50 text-[10px] uppercase tracking-wider font-semibold";
const td = "px-4 py-2 text-sm";
const tbl = "rounded-xl border border-border bg-card shadow-card overflow-hidden";
const trCls = "border-b border-border/20 hover:bg-muted/30 transition-colors";

function UsersTable({ data }: { data: any }) {
  if (!data?.users) return null;
  return (<div className={tbl}><div className="overflow-x-auto"><table className="w-full">
    <thead><tr className="border-b border-border/60"><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Location</th><th className={th}>Status</th><th className={th}>Joined</th></tr></thead>
    <tbody>{data.users.map((u: any) => (
      <tr key={u.id} className={trCls}>
        <td className={`${td} font-medium text-charcoal`}>{u.first_name} {u.last_name}</td>
        <td className={`${td} text-charcoal/60`}>{u.email}</td>
        <td className={`${td} text-charcoal/60`}>{[u.city, u.country].filter(Boolean).join(", ") || "—"}</td>
        <td className={td}><span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${u.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{u.is_active ? "Active" : "Inactive"}</span></td>
        <td className={`${td} text-charcoal/45 text-xs`}>{new Date(u.created_at).toLocaleDateString()}</td>
      </tr>
    ))}</tbody></table></div></div>);
}

function CitiesTable({ data, onEdit, onDelete }: { data: any; onEdit: any; onDelete: any }) {
  if (!data?.cities) return null;
  return (<div className={tbl}><div className="overflow-x-auto"><table className="w-full">
    <thead><tr className="border-b border-border/60"><th className={th}>City</th><th className={th}>Country</th><th className={th}>Code</th><th className={th}>Score</th><th className={th}>Actions</th></tr></thead>
    <tbody>{data.cities.map((c: any) => (
      <tr key={c.id} className={trCls}>
        <td className={`${td} font-medium text-charcoal`}>{c.name}</td>
        <td className={`${td} text-charcoal/60`}>{c.country}</td>
        <td className={`${td} text-charcoal/50`}>{c.country_code}</td>
        <td className={td}><span className="text-xs bg-teal/10 text-teal rounded-full px-2 py-0.5 font-medium">{Number(c.popularity_score).toFixed(0)}</span></td>
        <td className={td}>
          <div className="flex gap-1">
            <button onClick={() => onEdit(c)} className="p-1.5 rounded-lg hover:bg-muted text-charcoal/40 hover:text-teal cursor-pointer"><Edit3 size={14} /></button>
            <button onClick={() => onDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal/40 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
          </div>
        </td>
      </tr>
    ))}</tbody></table></div></div>);
}

function ActivitiesTable({ data, onEdit, onDelete }: { data: any; onEdit: any; onDelete: any }) {
  if (!data?.activities) return null;
  return (<div className={tbl}><div className="overflow-x-auto"><table className="w-full">
    <thead><tr className="border-b border-border/60"><th className={th}>Activity</th><th className={th}>City</th><th className={th}>Category</th><th className={th}>Rating</th><th className={th}>Actions</th></tr></thead>
    <tbody>{data.activities.map((a: any) => (
      <tr key={a.id} className={trCls}>
        <td className={`${td} font-medium text-charcoal`}>{a.name}</td>
        <td className={`${td} text-charcoal/60`}>{a.city_name || "—"}</td>
        <td className={td}><span className="text-xs bg-teal/10 text-teal rounded-full px-2 py-0.5">{a.category?.replace(/_/g, " ")}</span></td>
        <td className={`${td} text-charcoal/60`}>⭐ {Number(a.rating).toFixed(1)}</td>
        <td className={td}>
          <div className="flex gap-1">
            <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg hover:bg-muted text-charcoal/40 hover:text-teal cursor-pointer"><Edit3 size={14} /></button>
            <button onClick={() => onDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal/40 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
          </div>
        </td>
      </tr>
    ))}</tbody></table></div></div>);
}

function PostsTable({ data, onDelete, onRestore, onFeature }: { data: any; onDelete: any; onRestore: any; onFeature: any }) {
  if (!data?.posts) return null;
  return (<div className={tbl}><div className="overflow-x-auto"><table className="w-full">
    <thead><tr className="border-b border-border/60"><th className={th}>Title</th><th className={th}>Author</th><th className={th}>Stats</th><th className={th}>Status</th><th className={th}>Actions</th></tr></thead>
    <tbody>{data.posts.map((p: any) => {
      const removed = !!p.deleted_at;
      return (
        <tr key={p.id} className={`${trCls} ${removed ? "opacity-50" : ""}`}>
          <td className={`${td} font-medium text-charcoal max-w-[200px] truncate`}>{p.title}</td>
          <td className={`${td} text-charcoal/60`}>{p.author_first_name} {p.author_last_name}</td>
          <td className={`${td} text-charcoal/50 text-xs`}>♥{p.like_count} 👁{p.view_count} 💬{p.comment_count}</td>
          <td className={td}>
            <div className="flex gap-1">
              {removed && <span className="text-[10px] bg-red-50 text-red-500 rounded-full px-2 py-0.5 font-bold">Removed</span>}
              {p.is_featured && <span className="text-[10px] bg-amber-50 text-amber-600 rounded-full px-2 py-0.5 font-bold">Featured</span>}
              {!removed && !p.is_featured && <span className="text-[10px] bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 font-bold">Live</span>}
            </div>
          </td>
          <td className={td}>
            <div className="flex gap-1">
              <button onClick={() => onFeature(p.id)} title="Toggle featured" className="p-1.5 rounded-lg hover:bg-amber-50 text-charcoal/40 hover:text-amber-500 cursor-pointer"><Star size={14} /></button>
              {removed
                ? <button onClick={() => onRestore(p.id)} title="Restore" className="p-1.5 rounded-lg hover:bg-emerald-50 text-charcoal/40 hover:text-emerald-500 cursor-pointer"><RotateCcw size={14} /></button>
                : <button onClick={() => onDelete(p.id)} title="Remove" className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal/40 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
              }
            </div>
          </td>
        </tr>
      );
    })}</tbody></table></div></div>);
}
