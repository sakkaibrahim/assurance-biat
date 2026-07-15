import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CloudLightning,
  Gauge,
  LayoutDashboard,
  Loader2,
  MapPin,
  Maximize2,
  MessageSquareText,
  Minimize2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
  ClipboardList,
  TrendingUp,
  FileText,
  Sun,
  Moon,
  Type,
  Speaker,
  Volume2,
  VolumeX
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip as LeafletTooltip
} from "react-leaflet";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const colors = ["#2f6bff", "#ff4d5e", "#19c3b2", "#ffb020", "#8b5cf6", "#1b3fb0"];
const segColors = {
  standard: "#3446b0",
  affluent: "#0c8a7d",
  premium: "#a9680b",
  young: "#6d3bd4",
  senior: "#c8243a"
};

function formatMoney(value) {
  const n = Math.round(value || 0);
  if (n >= 1_000_000) return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " TND";
  if (n >= 1_000) return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " TND";
  return n + " TND";
}

function initials(name) {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function avatarColor(seed) {
  let h = 0;
  for (let i = 0; i < String(seed).length; i++) h = (h * 31 + String(seed).charCodeAt(i)) % 360;
  return `hsl(${h}, 62%, 52%)`;
}

function useApi(path, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    console.log(`useApi load: ${API}${path}`);
    setLoading(true);
    try {
      const res = await fetch(`${API}${path}`);
      const json = await res.json();
      console.log(`useApi success: ${path}`, json);
      setData(json);
    } catch (err) {
      console.error(`useApi error: ${path}`, err);
      setData(fallback);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  return { data, loading, load };
}

function Stat({ icon: Icon, label, value, tone, sub }) {
  return (
    <div className={`kpi ${tone}`}>
      <div className="kpiTop">
        <span className="kpiIcon"><Icon size={18} /></span>
        {label}
      </div>
      <div>
        <div className="kpiValue">{value}</div>
        {sub ? <div className="kpiSub">{sub}</div> : null}
      </div>
    </div>
  );
}

function extractChecklist(text) {
  if (!text) return [];
  const cleaned = String(text).replace(/\r/g, "");
  const candidates = cleaned.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const bullets = [];
  for (const line of candidates) {
    const isBullet = /^[-•*]\s+/.test(line) || /^\d+\)\s+/.test(line) || /^\d+\.\s+/.test(line);
    if (isBullet) bullets.push(line.replace(/^[-•*]\s+/, "").replace(/^\d+[)\.]\s+/, ""));
    if (bullets.length >= 6) break;
  }
  if (bullets.length >= 3) return bullets.slice(0, 6);
  const sentences = cleaned.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const verbs = ["proposer", "vérifier", "appeler", "contacter", "ajuster", "documenter", "demander", "orienter", "planifier", "confirmer"];
  return sentences
    .map((s) => ({ s, score: verbs.reduce((n, v) => n + (s.toLowerCase().includes(v) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > 0)
    .map((x) => x.s)
    .slice(0, 6);
}

const NAV = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "copilot", label: "Copilote", icon: Bot },
  { id: "pdfchat", label: "PDF Chat", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "map", label: "Carte Tunisie", icon: MapPin },
  { id: "risk", label: "Stress test", icon: CloudLightning },
  { id: "devis", label: "Simulateur devis", icon: Calculator },
  { id: "direction", label: "Direction", icon: Gauge },
  { id: "alerts", label: "Alertes", icon: AlertTriangle }
];

export default function BriefingApp() {
  const [view, setView] = useState("overview");
  const [kiosk, setKiosk] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("biat_dark") === "1"; } catch { return false; }
  });
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem("biat_font") || "16", 10); } catch { return 16; }
  });
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    try { return localStorage.getItem("biat_tts") === "1"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font", `${fontSize / 16}rem`);
    try { localStorage.setItem("biat_font", String(fontSize)); } catch { /* ignore */ }
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("biat_dark", dark ? "1" : "0"); } catch { /* ignore */ }
  }, [dark]);

  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "fr-FR";
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  const summary = useApi("/dashboard/summary", {});
  const charts = useApi("/dashboard/charts", { products: [], cities: [], payments: [], claims: [] });
  const alerts = useApi("/alerts", []);
  const facets = useApi("/clients/facets", { cities: [], segments: [] });
  const executive = useApi("/dashboard/executive", {});
  const governoratesExposure = useApi("/analytics/governorates-exposure", []);

  const refreshAll = () => {
    console.log("refreshAll clicked");
    summary.load();
    charts.load();
    alerts.load();
    executive.load();
    governoratesExposure.load();
    if (view === "clients") clientApi.load();
  };

  const kpis = [
    { icon: UserRound, label: "Clients", value: summary.data.clients || 0, tone: "blue", sub: "base BIAT" },
    { icon: BriefcaseBusiness, label: "Contrats", value: summary.data.contracts || 0, tone: "violet", sub: `${summary.data.active_contracts || 0} actifs` },
    { icon: TrendingUp, label: "Revenus", value: formatMoney(summary.data.paid_revenue), tone: "teal", sub: "encaissés" },
    { icon: AlertTriangle, label: "Churn estimé", value: `${Math.round((summary.data.churn_rate || 0) * 100)}%`, tone: "red", sub: "risque résiliation" }
  ];

  // client directory state (persisted in localStorage)
  const loadFilter = (k, d) => { try { const v = localStorage.getItem("biat_filter_" + k); return v === null ? d : v; } catch { return d; } };
  const [search, setSearch] = useState(() => loadFilter("search", ""));
  const [city, setCity] = useState(() => loadFilter("city", ""));
  const [segment, setSegment] = useState(() => loadFilter("segment", ""));
  const [page, setPage] = useState(0);
  const LIMIT = 24;

  const persist = (k, v) => { try { localStorage.setItem("biat_filter_" + k, v); } catch { /* ignore */ } };
  const setSearchP = (v) => { setSearch(v); persist("search", v); };
  const setCityP = (v) => { setCity(v); persist("city", v); };
  const setSegmentP = (v) => { setSegment(v); persist("segment", v); };

  const clientQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (search.trim()) p.set("search", search.trim());
    if (city) p.set("city", city);
    if (segment) p.set("segment", segment);
    p.set("limit", String(LIMIT));
    p.set("offset", String(page * LIMIT));
    return p.toString();
  }, [search, city, segment, page]);

  const clientApi = useApi(`/clients?${clientQuery}`, { total: 0, items: [] });
  useEffect(() => { if (view === "clients") clientApi.load(); }, [clientQuery, view]); // eslint-disable-line

  // Dynamic alerts: auto-refresh every 15s so the board stays live
  useEffect(() => {
    const id = setInterval(() => alerts.load(), 15000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const [ack, setAck] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem("biat_ack") || "[]")); } catch { return new Set(); } });
  const unackAlerts = (alerts.data || []).filter((a) => !ack.has(a.id));
  const alertTotal = unackAlerts.length;
  const alertHigh = unackAlerts.filter((a) => a.severity === "high").length;

  function acknowledge(id) {
    setAck((prev) => {
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem("biat_ack", JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  const [drawerClient, setDrawerClient] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  async function openClient(id) {
    setDrawerLoading(true);
    setDrawerClient(null);
    try {
      const res = await fetch(`${API}/clients/${id}/360`);
      setDrawerClient(await res.json());
    } catch {
      setDrawerClient(null);
    } finally {
      setDrawerLoading(false);
    }
  }

  return (
    <>
      <div className="bgFx">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>

      <div className={kiosk ? "app kiosk" : "app"}>
        <aside className="sidebar">
          <div className="sideBrand">
            <div className="sideMark"><ShieldCheck size={24} /></div>
            <div>
              <strong>BIAT Assurance</strong>
              <span>AI Copilot</span>
            </div>
          </div>

          <nav className="sideNav">
            {NAV.map((n) => {
              const Icon = n.icon;
              const badge = n.id === "alerts" && alertHigh > 0 ? alertHigh : null;
              return (
                <button
                  key={n.id}
                  className={`navItem ${view === n.id ? "active" : ""}`}
                  onClick={() => setView(n.id)}
                >
                  <Icon size={18} />
                  {n.label}
                  {badge ? <span className="navBadge">{badge}</span> : <span className="navDot" />}
                </button>
              );
            })}
          </nav>

          <div className="sideFoot">
            <span className="liveDot" />
            <span>
              XAMPP MySQL · live
              {alertTotal > 0 && (
                <strong style={{ display: "block", color: alertHigh ? "#ff4d5e" : "#19c3b2", marginTop: 2 }}>
                  {alertHigh} alerte(s) critique(s) · {alertTotal} total
                </strong>
              )}
            </span>
          </div>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="topKicker">BIAT Assurance · console métier</p>
              <h1 className="topTitle">
                {view === "overview" && "Tableau de bord"}
                {view === "clients" && "Annuaire des clients"}
                {view === "copilot" && "Copilote conseiller"}
                {view === "pdfchat" && "Lecteur PDF + IA"}
                {view === "analytics" && "Analytics portefeuille"}
                {view === "map" && "Carte de Tunisie"}
                {view === "risk" && "Stress test risque"}
                {view === "devis" && "Simulateur de devis"}
                {view === "direction" && "Tableau de bord direction"}
                {view === "alerts" && "Alertes intelligentes"}
              </h1>
            </div>
            <div className="topActions">
              {view === "clients" && (
                <div className="searchBox">
                  <Search size={16} className="muted" />
                  <input
                    placeholder="Rechercher un client…"
                    value={search}
                    onChange={(e) => { setSearchP(e.target.value); setPage(0); }}
                  />
                </div>
              )}
              <button className="btn ghost" onClick={() => setKiosk((k) => !k)} title="Mode présentation">
                {kiosk ? <Minimize2 size={16} /> : <Maximize2 size={16} />} {kiosk ? "Quitter" : "Présenter"}
              </button>
              <button className="btn ghost" onClick={() => setDark((d) => !d)} title={dark ? "Mode clair" : "Mode sombre"} aria-label="Basculer mode sombre">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="btn ghost" onClick={() => setFontSize((s) => Math.min(22, s + 2))} title="Agrandir le texte" aria-label="Agrandir le texte">
                <Type size={16} /> A+
              </button>
              <button className="btn ghost" onClick={() => setFontSize((s) => Math.max(12, s - 2))} title="Réduire le texte" aria-label="Réduire le texte">
                <Type size={14} /> A-
              </button>
              <button className="btn ghost" onClick={() => setTtsEnabled((t) => !t)} title={ttsEnabled ? "Désactiver la lecture vocale" : "Activer la lecture vocale"} aria-label="Basculer lecture vocale">
                {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button className="btn ghost" onClick={refreshAll}>
                <RefreshCcw size={16} /> Actualiser
              </button>
            </div>
          </header>

          {view === "overview" && (
            <OverviewView kpis={kpis} charts={charts} alerts={alerts} onOpenClient={openClient} onAskCopilot={() => setView("copilot")} />
          )}
          {view === "clients" && (
            <ClientsView
              clientApi={clientApi}
              facets={facets.data}
              search={search}
              setSearch={(v) => { setSearchP(v); setPage(0); }}
              city={city}
              setCity={(v) => { setCityP(v); setPage(0); }}
              segment={segment}
              setSegment={(v) => { setSegmentP(v); setPage(0); }}
              page={page}
              setPage={setPage}
              limit={LIMIT}
              onOpenClient={openClient}
            />
          )}
          {view === "copilot" && <CopilotView />}
          {view === "pdfchat" && <PdfChatView apiUrl={API} />}
          {view === "analytics" && <AnalyticsView charts={charts} />}
          {view === "map" && <MapView governoratesExposure={governoratesExposure} />}
          {view === "risk" && <RiskView facets={facets.data} />}
          {view === "devis" && <DevisView />}
          {view === "direction" && <DirectionView executive={executive} charts={charts} />}
          {view === "alerts" && <AlertsView onOpenClient={openClient} ack={ack} acknowledge={acknowledge} />}
        </section>
      </div>

      {drawerClient || drawerLoading ? (
        <Client360Drawer client={drawerClient} loading={drawerLoading} onClose={() => setDrawerClient(null)} />
      ) : null}
    </>
  );
}

/* ============ Overview ============ */
function OverviewView({ kpis, charts, alerts, onOpenClient, onAskCopilot }) {
  const premiumSeries = charts.data.products.map((item, i) => ({
    name: String(item.name || "").replace("ProductType.", ""),
    premium: item.premium,
    contracts: item.contracts,
    fill: colors[i % colors.length]
  }));
  const topAlerts = (alerts.data || []).slice(0, 6);

  return (
    <div className="stack">
      <div className="kpiGrid">
        {kpis.map((k, i) => <Stat key={i} {...k} />)}
      </div>

      <div className="gridTwo">
        <div className="stack">
          <div className="panel">
            <div className="panelTitle">
              <div><h2>Portefeuille</h2><span>Primes, sinistres & répartition ville</span></div>
              <span className="badge"><Sparkles size={14} /> live</span>
            </div>
            <div className="chartsGrid">
              <div className="chartCard">
                <h3>Primes / produit</h3>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={premiumSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v, n) => (n === "premium" ? formatMoney(v) : v)} />
                    <Bar dataKey="premium" name="Prime totale" radius={[6, 6, 0, 0]}>
                      {premiumSeries.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chartCard">
                <h3>Sinistres (parts)</h3>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={charts.data.claims || []} dataKey="amount" nameKey="name" innerRadius={46} outerRadius={78}>
                      {(charts.data.claims || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chartCard wide">
                <h3>Clients par ville</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={charts.data.cities || []}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2f6bff" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#2f6bff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="clients" stroke="#2f6bff" fill="url(#g1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panelTitle">
              <div><h2>Alertes du jour</h2><span>Priorisées</span></div>
              <span className="badge red">{topAlerts.length} signaux</span>
            </div>
            <div className="alertList">
              {topAlerts.map((a, i) => (
                <div className={`alertRow ${a.severity === "high" ? "high" : ""}`} key={i}>
                  <AlertTriangle size={16} className="alertIco" />
                  <div className="alertMain">
                    <strong>{a.title}</strong>
                    <span>{a.type} · {a.severity}</span>
                  </div>
                </div>
              ))}
              {!topAlerts.length && <div className="emptyState"><AlertTriangle size={18} /><div><strong>Aucune alerte</strong><p>Calme plat aujourd'hui.</p></div></div>}
            </div>
          </div>

          <div className="panel">
            <div className="panelTitle"><div><h2>Copilote</h2><span>Poser une question métier</span></div></div>
            <div className="tip"><Bot size={18} /><span>Lancez le copilote pour obtenir des recommandations actionnables sur un client.</span></div>
            <button className="btn primary" style={{ marginTop: 12, width: "100%" }} onClick={onAskCopilot}>
              <MessageSquareText size={16} /> Ouvrir le copilote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Clients directory ============ */
function ClientsView({ clientApi, facets, search, setSearch, city, setCity, segment, setSegment, page, setPage, limit, onOpenClient }) {
  const items = clientApi.data.items || [];
  const total = clientApi.data.total || 0;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="stack">
      <div className="panel">
        <div className="clientsHead" style={{ marginBottom: 14 }}>
          <div className="filterChips">
            <button className={`chip ${!segment ? "active" : ""}`} onClick={() => setSegment("")}>Tous segments</button>
            {(facets.segments || []).map((s) => (
              <button key={s} className={`chip ${segment === s ? "active" : ""}`} onClick={() => setSegment(s)}>{s}</button>
            ))}
          </div>
          <div className="filterChips">
            <button className={`chip ${!city ? "active" : ""}`} onClick={() => setCity("")}>Toutes villes</button>
            {(facets.cities || []).map((c) => (
              <button key={c} className={`chip ${city === c ? "active" : ""}`} onClick={() => setCity(c)}>{c}</button>
            ))}
          </div>
        </div>

        {clientApi.loading ? (
          <div className="emptyState"><Loader2 size={18} className="spin" /><div><strong>Chargement…</strong></div></div>
        ) : (
          <div className="clientGrid">
            {items.map((c) => (
              <button key={c.id} className="clientCard" onClick={() => onOpenClient(c.id)}>
                <div className="clientTop">
                  <div className="clientAvatar" style={{ background: avatarColor(c.id + c.full_name) }}>{initials(c.full_name)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="clientName">{c.full_name}</div>
                    <div className="clientCity"><MapPin size={12} />{c.city}</div>
                  </div>
                </div>
                <div className="clientMeta">
                  <span className={`seg ${c.segment}`}>{c.segment}</span>
                  <span className="clientContracts">{c.contracts_count} contrat(s)</span>
                </div>
              </button>
            ))}
            {!items.length && <div className="emptyState" style={{ gridColumn: "1/-1" }}><UserRound size={18} /><div><strong>Aucun client</strong><p>Ajustez la recherche ou les filtres.</p></div></div>}
          </div>
        )}

        <div className="pager">
          <button className="btn ghost" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
          <span className="count">Page {page + 1} / {pages} · {total} clients</span>
          <button className="btn ghost" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============ Client 360 drawer ============ */
function Client360Drawer({ client, loading, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="drawerOverlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer" role="dialog" aria-modal="true">
        <div className="drawerHead">
          <h2>Client 360</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>

        {loading ? (
          <div className="emptyState"><Loader2 size={20} className="spin" /><div><strong>Chargement…</strong></div></div>
        ) : client?.client ? (
          <>
            <div className="c360Hero">
              <div className="c360HeroAvatar">{initials(client.client.full_name)}</div>
              <div>
                <h3>{client.client.full_name}</h3>
                <p>{client.client.email}</p>
                <p>{client.client.city} · {client.client.segment} · {client.client.age} ans</p>
              </div>
              <div className="churnGauge">
                <div className="churnRing" style={{ "--val": Math.round((client.churn?.score || 0) * 100) }}>
                  <span>{Math.round((client.churn?.score || 0) * 100)}%</span>
                </div>
                <small>Churn · {client.churn?.level}</small>
              </div>
            </div>

            <div className="c360Grid">
              <div className="litePanel">
                <h4>Facteurs de churn</h4>
                {(client.churn?.factors || []).map((f) => (
                  <span className="factorTag" key={f.factor}>{f.factor} · {Math.round(f.impact * 100)} pts</span>
                ))}
              </div>

              <div className="litePanel">
                <h4>Contrats ({client.contracts?.length || 0})</h4>
                {(client.contracts || []).map((ct) => (
                  <div className="rowItem" key={ct.id}>
                    <div>
                      <strong>{ct.product}</strong>
                      <span>{formatMoney(ct.coverage_amount)} · {ct.status}</span>
                    </div>
                    <div className="miniBar"><i style={{ width: `${Math.round((ct.risk || 0) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="litePanel">
                <h4>Recommandations</h4>
                {(client.recommendations || []).length ? (
                  client.recommendations.map((r) => (
                    <div className="rowItem" key={r.product}>
                      <div><strong>{r.product}</strong><span>{r.reason}</span></div>
                      <span className="badge teal">{Math.round(r.score * 100)}%</span>
                    </div>
                  ))
                ) : <p className="muted">Aucune opportunité détectée.</p>}
              </div>

              <div className="litePanel">
                <h4>Dernières interactions</h4>
                {(client.interactions || []).slice(0, 5).map((it, i) => (
                  <div className="rowItem" key={i}>
                    <div><strong>{it.intent}</strong><span>{it.channel} · {it.notes}</span></div>
                    <span className={`badge ${it.sentiment < -0.1 ? "red" : ""}`}>{it.sentiment}</span>
                  </div>
                ))}
              </div>

              <div className="litePanel">
                <h4>Frise chronologique</h4>
                <div className="timeline">
                  {[
                    ...(client.claims || []).map((c) => ({ kind: "claim", label: `Sinistre ${c.product}`, sub: formatMoney(c.amount), tone: "red" })),
                    ...(client.contracts || []).map((c) => ({ kind: "contract", label: `Contrat ${c.product}`, sub: c.status, tone: "blue" })),
                    ...(client.interactions || []).map((c) => ({ kind: "interaction", label: c.intent, sub: `${c.channel}`, tone: "teal" })),
                  ]
                    .sort((a, b) => (a.label < b.label ? 1 : -1))
                    .slice(0, 8)
                    .map((ev, i) => (
                      <div className={`tlItem ${ev.tone}`} key={i}>
                        <span className="tlDot" />
                        <div><strong>{ev.label}</strong><span>{ev.sub}</span></div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="emptyState"><UserRound size={18} /><div><strong>Aucun client</strong><p>ID introuvable.</p></div></div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ============ Copilot ============ */
function CopilotView() {
  const [question, setQuestion] = useState("Quels clients BIAT Assurance ont un risque de résiliation élevé et quelles actions proposer ?");
  const [answer, setAnswer] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [humanTip, setHumanTip] = useState("Briefing : formulez une question orientée action.");
  const [chatInput, setChatInput] = useState(question);
  const [clientId, setClientId] = useState(1);
  const [messages, setMessages] = useState(() => [
    { id: "m0", role: "assistant", text: "Je suis votre copilote BIAT. Un signal clair → une proposition → une prochaine action concrète." }
  ]);
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, phase]);

  const checklist = useMemo(() => extractChecklist(answer?.answer), [answer]);

  async function askCopilot(q) {
    setPhase("searching");
    setHumanTip("Je parcours les documents et données de BIAT…");
    setMessages((p) => [...p, { id: `u-${Date.now()}`, role: "user", text: q }]);
    try {
      const res = await fetch(`${API}/rag/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, client_id: Number(clientId) || null })
      });
      const data = await res.json();
      setAnswer(data);
      setPhase("citing");
      setHumanTip("J'extrais les passages qui rendent la réponse vérifiable…");
      setTimeout(() => {
        setPhase("drafting");
        setHumanTip("Je reformule pour le conseiller : clair, bref, actionnable.");
        const reply = data?.answer || "Je n'ai pas pu produire une réponse.";
        setMessages((p) => [...p, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
      }, 420);
    } catch {
      setPhase("idle");
      setHumanTip("Oups… service injoignable. Réessayez.");
    }
  }

  return (
    <div className="gridTwo">
      <div className="panel chatWrap">
        <div className="panelTitle">
          <div><h2>Conversation conseiller</h2><span>Écoute → recherche → proposition</span></div>
          <div className="phaseRow">
            {phase === "idle" && <span className="phasePill">Prêt</span>}
            {phase === "searching" && <span className="phasePill warn">Recherche</span>}
            {phase === "citing" && <span className="phasePill warn">Citations</span>}
            {phase === "drafting" && <span className="phasePill ok">Rédaction</span>}
          </div>
        </div>

        <div className="chatLog" ref={scrollRef}>
          {messages.map((m) => (
            <div key={m.id} className={`bubbleRow ${m.role === "user" ? "userRow" : "assistantRow"}`}>
              {m.role === "assistant" && <div className="bubbleIco"><Bot size={16} /></div>}
              <div className={`bubble ${m.role === "user" ? "userBubble" : "assistantBubble"}`}>{m.text}</div>
            </div>
          ))}
          {phase !== "idle" && (
            <div className="bubbleRow assistantRow">
              <div className="bubbleIco"><Loader2 size={16} className="spin" /></div>
              <div className="bubble assistantBubble">{humanTip}</div>
            </div>
          )}
        </div>

        <div className="composer">
          <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ex: Quels clients BIAT ont un risque élevé ?" />
          <div style={{ display: "flex", gap: 10 }}>
            <input type="number" min="1" value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ maxWidth: 110 }} aria-label="ID client" />
            <button className="btn primary" style={{ flex: 1 }} disabled={phase !== "idle" && phase !== "drafting" && phase !== "citing"} onClick={() => { const q = chatInput.trim(); if (q) { setQuestion(q); askCopilot(q); } }}>
              <Search size={16} /> Interroger
            </button>
          </div>
        </div>
      </div>

      <div className="stack">
        <div className="panel">
          <div className="panelTitle"><div><h2>Carnet d'actions</h2><span>Max 6 étapes</span></div></div>
          {checklist.length ? (
            <div className="checklist">
              {checklist.map((c, i) => (
                <div className="checkItem" key={i}><div className="checkIdx">{i + 1}</div><div>{c}</div></div>
              ))}
            </div>
          ) : (
            <div className="emptyState"><ClipboardList size={18} /><div><strong>Rien à cocher</strong><p>Posez une question pour générer des actions.</p></div></div>
          )}
        </div>
        <div className="panel">
          <div className="panelTitle"><div><h2>Transparence</h2><span>On s'appuie, on ne promet pas</span></div></div>
          <div className="tip"><MessageSquareText size={16} /><span>Réponse orientée conseiller, pas jargon.</span></div>
          <div className="tip" style={{ marginTop: 10 }}><MapPin size={16} /><span>Sources (citations) proposées quand la réponse est sourcée.</span></div>
        </div>
      </div>
    </div>
  );
}

/* ============ Analytics ============ */
function AnalyticsView({ charts }) {
  const premiumSeries = charts.data.products.map((item, i) => ({ name: String(item.name || "").replace("ProductType.", ""), premium: item.premium, fill: colors[i % colors.length] }));
  const paymentSeries = charts.data.payments || [];
  return (
    <div className="gridTwo">
      <div className="stack">
        <div className="panel">
          <div className="panelTitle"><div><h2>Primes par produit</h2></div></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={premiumSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="premium" radius={[8, 8, 0, 0]}>
                {premiumSeries.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panelTitle"><div><h2>Clients par ville</h2></div></div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.data.cities || []}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#19c3b2" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#19c3b2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="clients" stroke="#19c3b2" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="stack">
        <div className="panel">
          <div className="panelTitle"><div><h2>Sinistres (parts)</h2></div></div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.data.claims || []} dataKey="amount" nameKey="name" innerRadius={56} outerRadius={100} label>
                {(charts.data.claims || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatMoney(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panelTitle"><div><h2>Paiements</h2><span>répartition statuts</span></div></div>
          <div className="chartsGrid" style={{ gridTemplateColumns: "1fr" }}>
            {paymentSeries.map((p) => (
              <div className="rowItem" key={p.name}>
                <div><strong>{p.name}</strong><span>{p.count} paiements</span></div>
                <span className="badge">{p.late_amount ? formatMoney(p.late_amount) : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Risk (creative stress test) ============ */
const EVENTS = [
  { id: "inondation", label: "Inondation", icon: CloudLightning, tint: "#2f6bff" },
  { id: "tempete", label: "Tempête", icon: CloudLightning, tint: "#19c3b2" },
  { id: "seisme", label: "Séisme", icon: CloudLightning, tint: "#ff4d5e" },
];

function RiskView({ facets }) {
  const [event, setEvent] = useState("seisme");
  const [severity, setSeverity] = useState(68);
  const [region, setRegion] = useState("");
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  async function simulate() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/risk/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: event, severity: severity / 100, region: region || null })
      });
      setRisk(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const maxProduct = Math.max(1, ...(risk?.by_product || []).map((p) => p.estimated_loss));
  const maxCity = Math.max(1, ...(risk?.by_city || []).map((c) => c.estimated_loss));
  const scenarios = risk?.scenarios || EVENTS.map((e) => ({ event_type: e.id, multiplier: 1 }));

  return (
    <div className="stack">
      <div className="panel">
        <div className="panelTitle">
          <div><h2>Stress test · exposition au risque</h2><span>Simulez un scénario catastrophe sur le portefeuille</span></div>
          <span className="badge red"><CloudLightning size={14} /> {event}</span>
        </div>

        <div className="riskControls">
          <div className="riskEvents">
            {EVENTS.map((e) => {
              const Icon = e.icon;
              return (
                <button
                  key={e.id}
                  className={`eventBtn ${event === e.id ? "active" : ""}`}
                  style={event === e.id ? { borderColor: e.tint, boxShadow: `0 12px 26px -12px ${e.tint}` } : {}}
                  onClick={() => setEvent(e.id)}
                >
                  <span className="eventIco" style={{ background: e.tint }}><Icon size={16} /></span>
                  {e.label}
                </button>
              );
            })}
          </div>

          <div className="severityBox">
            <div className="severityHead">
              <span>Sévérité</span>
              <strong>{severity}%</strong>
            </div>
            <input
              type="range" min="0" max="100" value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="filterChips">
            <button className={`chip ${!region ? "active" : ""}`} onClick={() => setRegion("")}>Toute la Tunisie</button>
            {(facets.cities || []).slice(0, 6).map((c) => (
              <button key={c} className={`chip ${region === c ? "active" : ""}`} onClick={() => setRegion(c)}>{c}</button>
            ))}
          </div>

          <button className="btn primary" style={{ width: "100%" }} disabled={loading} onClick={simulate}>
            {loading ? <Loader2 size={16} className="spin" /> : <CloudLightning size={16} />}
            Lancer la simulation
          </button>
        </div>
      </div>

      {risk && (
        <>
          <div className="riskHero">
            <div>
              <div className="riskHeroKicker">{risk.event_type} · sévérité {Math.round(risk.severity * 100)}% · multiplicateur ×{risk.multiplier}</div>
              <div className="riskHeroBig">{formatMoney(risk.estimated_loss)}</div>
              <div className="riskHeroSub">perte financière estimée</div>
            </div>
            <div className="riskHeroStats">
              <div><strong>{risk.affected_contracts}</strong><span>contrats exposés</span></div>
              <div><strong>{formatMoney(risk.exposed_coverage)}</strong><span>capital exposé</span></div>
            </div>
          </div>

          <div className="gridTwo">
            <div className="panel">
              <div className="panelTitle"><div><h2>Comparaison des scénarios</h2><span>facteur de perte</span></div></div>
              <div className="scenarioList">
                {scenarios.map((s) => (
                  <div key={s.event_type} className={`scenarioRow ${s.event_type === event ? "active" : ""}`}>
                    <span className="scenarioName">{s.event_type}</span>
                    <div className="scenarioBar"><i style={{ width: `${Math.min(100, s.multiplier / 1.8 * 100)}%` }} /></div>
                    <span className="scenarioMult">×{s.multiplier}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panelTitle"><div><h2>Perte par produit</h2><span>répartition</span></div></div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={risk.by_product} layout="vertical" margin={{ left: 20, right: 16 }}>
                  <XAxis type="number" tickFormatter={(v) => formatMoney(v)} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatMoney(v)} />
                  <Bar dataKey="estimated_loss" name="Perte" radius={[0, 6, 6, 0]}>
                    {(risk.by_product || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panelTitle"><div><h2>Exposition par ville</h2><span>hotspots de risque</span></div></div>
            <div className="heatList">
              {(risk.by_city || []).map((c) => (
                <div className="heatRow" key={c.city}>
                  <span className="heatCity"><MapPin size={13} /> {c.city}</span>
                  <div className="heatBar"><i style={{ width: `${(c.estimated_loss / maxCity) * 100}%` }} /></div>
                  <span className="heatVal">{formatMoney(c.estimated_loss)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panelTitle"><div><h2>Contrats les plus exposés</h2><span>top 10</span></div></div>
            <div className="riskList">
              {(risk.top_exposures || []).map((e) => (
                <div className="rowItem" key={e.contract_id}>
                  <div><strong>Contrat #{e.contract_id}</strong><span>Client #{e.client_id} · {e.product}</span></div>
                  <span className="badge red">{formatMoney(e.estimated_loss)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============ Tunisia map (Leaflet interactive) ============ */
const GOV_COORDS = {
  Tunis: [36.8065, 10.1815], Ariana: [36.8665, 10.1647], "Ben Arous": [36.7199, 10.213],
  Manouba: [36.8105, 10.101], Nabeul: [36.4514, 10.7357], Bizerte: [37.2744, 9.8739],
  Zaghouan: [36.4028, 10.1425], Kef: [36.1742, 8.7049], Siliana: [36.0833, 9.3833],
  Sousse: [35.8256, 10.6084], Monastir: [35.7779, 10.8265], Mahdia: [35.5047, 11.0622],
  Sfax: [34.7406, 10.76], Gabès: [33.8815, 10.097], Medenine: [33.3549, 10.5038],
  Tozeur: [33.9197, 8.1335], Kairouan: [35.6711, 10.1003], Gafsa: [34.425, 8.7839],
  Kasserine: [35.1676, 8.8285], "Sidi Bouzid": [35.0378, 9.4858], Kebili: [33.7043, 8.9698],
};

function MapView({ governoratesExposure }) {
  const data = governoratesExposure.data || [];
  const maxExp = Math.max(1, ...data.map((d) => d.exposure || 0));
  const totalExposure = data.reduce((s, d) => s + (d.exposure || 0), 0);

  const byGov = Object.fromEntries(data.map((d) => [d.governorate, d]));
  const riskColor = (r) => (r > 0.55 ? "#ff4d5e" : r > 0.35 ? "#ffb020" : "#19c3b2");
  const sorted = [...data].sort((a, b) => (b.exposure || 0) - (a.exposure || 0));

  return (
    <div className="mapWrap">
      <div className="panel mapPanel">
        <div className="panelTitle">
          <div>
            <h2>Carte des gouvernorats</h2>
            <span>exposition financière par zone · interactive</span>
          </div>
          <span className="badge"><MapPin size={14} /> {data.length} gouvernorats</span>
        </div>

        <div className="mapLeft">
          <div className="leafletMap" role="img" aria-label="Carte interactive Tunisie">
            <MapContainer center={[34.0, 9.5]} zoom={7} scrollWheelZoom={true} style={{ height: 420, borderRadius: 14, border: "1px solid var(--line)" }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {sorted.map((d) => {
                const pos = GOV_COORDS[d.governorate];
                if (!pos) return null;
                const exp = d.exposure || 0;
                const risk = d.avg_risk || 0;
                const radius = 12 + (exp / maxExp) * 28;
                return (
                  <CircleMarker key={d.governorate} center={pos} radius={radius} pathOptions={{ color: riskColor(risk), fillColor: riskColor(risk), fillOpacity: 0.7, weight: 2 }}>
                    <LeafletTooltip direction="top" offset={[0, -radius]} opacity={1}>
                      <strong>{d.governorate}</strong><br />
                      Exposition: {formatMoney(exp)}<br />
                      Risque: {Math.round(risk * 100)}%
                    </LeafletTooltip>
                    <Popup>
                      <strong>{d.governorate}</strong><br />
                      Clients: {d.clients || 0}<br />
                      Exposition: {formatMoney(exp)}<br />
                      Risque moyen: {Math.round(risk * 100)}%
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Cliquez sur un cercle pour les détails · Survol pour un aperçu · Couleur = risque · Taille = exposition.
          </p>
        </div>

        <div className="mapRight">
          <div className="mapTotal">
            <span>Exposition totale</span>
            <strong>{formatMoney(totalExposure)}</strong>
          </div>
          <div className="mapZoneList">
            {sorted.map((d) => (
              <div className="mapZoneRow" key={d.governorate}>
                <span className="mapZoneDot" style={{ background: riskColor(d.avg_risk || 0) }} />
                <span className="mapZoneName">{d.governorate}</span>
                <div className="mapZoneBar"><i style={{ width: `${((d.exposure || 0) / totalExposure) * 100}%`, background: riskColor(d.avg_risk || 0) }} /></div>
                <span className="mapZoneMoney">{formatMoney(d.exposure || 0)}</span>
                <span className="mapZonePct">{Math.round(((d.exposure || 0) / totalExposure) * 100)}%</span>
              </div>
            ))}
            {!data.length && (
              <div className="emptyState">
                <MapPin size={18} />
                <div>
                  <strong>Pas de données</strong>
                  <p>Essayez “Actualiser”.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Quote simulator ============ */
const PRODUCTS = ["auto", "home", "health", "life", "travel", "business"];
const PRODUCT_LABELS = { auto: "Auto", home: "Habitation", health: "Santé", life: "Vie", travel: "Voyage", business: "Entreprise" };

function DevisView() {
  const [product, setProduct] = useState("auto");
  const [age, setAge] = useState(35);
  const [income, setIncome] = useState(40000);
  const [city, setCity] = useState("Tunis");
  const [result, setResult] = useState(null);
  const exposure = useApi("/analytics/cities-exposure", []);
  const riskByCity = {};
  (exposure.data || []).forEach((d) => { riskByCity[d.city] = d.avg_risk; });

  async function estimate() {
    const region_risk = riskByCity[city] ?? 0.2;
    const url = `${API}/quote/estimate?product=${product}&age=${age}&income=${income}&region_risk=${region_risk}&city=${encodeURIComponent(city)}`;
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setResult(await r.json());
  }

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <div className="panel">
        <div className="panelTitle"><div><h2>Simulateur de devis</h2><span>estimez une prime en direct</span></div>
          <span className="badge"><Calculator size={14} /> TND</span></div>
        <div className="quoteGrid">
          <label>Produit
            <select value={product} onChange={(e) => setProduct(e.target.value)}>
              {PRODUCTS.map((p) => <option key={p} value={p}>{PRODUCT_LABELS[p]}</option>)}
            </select>
          </label>
          <label>Âge
            <input type="number" value={age} min="18" max="90" onChange={(e) => setAge(Number(e.target.value))} />
          </label>
          <label>Revenu (TND)
            <input type="number" value={income} min="0" step="1000" onChange={(e) => setIncome(Number(e.target.value))} />
          </label>
          <label>Ville
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {(exposure.data || []).map((d) => <option key={d.city} value={d.city}>{d.city}</option>)}
            </select>
          </label>
        </div>
        <button className="btn primary" style={{ width: "100%", marginTop: 14 }} onClick={estimate}>
          <Calculator size={16} /> Calculer la prime
        </button>

        {result && (
          <div className="quoteResult">
            <div><span>Prime annuelle</span><strong>{formatMoney(result.prime_annual)}</strong></div>
            <div><span>Prime mensuelle</span><strong>{formatMoney(result.prime_monthly)}</strong></div>
            <div className="quoteFactors">
              {Object.entries(result.factors || {}).map(([k, v]) => (
                <span key={k} className="factorTag">{k} · {v}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Direction (executive) ============ */
function DirectionView({ executive, charts }) {
  const e = executive.data || {};
  const kpis = [
    { icon: UserRound, label: "ARPU", value: formatMoney(e.arpu), tone: "blue", sub: "revenu / client" },
    { icon: BriefcaseBusiness, label: "Prime moyenne", value: formatMoney(e.avg_premium), tone: "violet", sub: "par contrat" },
    { icon: Gauge, label: "Pénétration", value: `${Math.round((e.penetration_rate || 0) * 100)}%`, tone: "teal", sub: "multi-équipement" },
    { icon: AlertTriangle, label: "Sinistres ouverts", value: e.claims_open || 0, tone: "red", sub: `ratio ${Math.round((e.claims_ratio || 0) * 100)}%` },
  ];
  const premiumSeries = (charts.data.products || []).map((item, i) => ({ name: String(item.name || "").replace("ProductType.", ""), premium: item.premium, fill: colors[i % colors.length] }));
  return (
    <div className="stack">
      <div className="kpiGrid">
        {kpis.map((k, i) => <Stat key={i} {...k} />)}
      </div>
      <div className="gridTwo">
        <div className="panel">
          <div className="panelTitle"><div><h2>Primes par produit</h2></div></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={premiumSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="premium" radius={[8, 8, 0, 0]}>
                {premiumSeries.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="stack">
          <div className="panel">
            <div className="panelTitle"><div><h2>Taux de pénétration</h2><span>clients multi-équipés</span></div></div>
            <div className="gaugeWrap">
              <div className="gaugeRing" style={{ "--val": Math.round((e.penetration_rate || 0) * 100) }}>
                <span>{Math.round((e.penetration_rate || 0) * 100)}%</span>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panelTitle"><div><h2>Sinistres ouverts</h2></div></div>
            <div className="gaugeWrap">
              <div className="gaugeRing red" style={{ "--val": Math.round((e.claims_ratio || 0) * 100) }}>
                <span>{Math.round((e.claims_ratio || 0) * 100)}%</span>
              </div>
              <p className="muted" style={{ textAlign: "center", fontSize: 12, marginTop: 8 }}>part des sinistres encore ouverts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Alerts (dynamic + email + thresholds) ============ */
function AlertsView({ alerts, onOpenClient, ack, acknowledge }) {
  const [minClaim, setMinClaim] = useState(20000);
  const [minRisk, setMinRisk] = useState(0.72);
  const [cats, setCats] = useState({ payment: true, exposure: true, claim: true, churn: true, cross: true, revenue: true });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const q = useMemo(() => new URLSearchParams({
    min_claim: String(minClaim),
    min_risk: String(minRisk),
    include_payment: String(cats.payment),
    include_exposure: String(cats.exposure),
    include_claim: String(cats.claim),
    include_churn: String(cats.churn),
    include_cross_sell: String(cats.cross),
    include_revenue: String(cats.revenue),
  }).toString(), [minClaim, minRisk, cats]);

  const list = (alerts.data || []).filter((a) => !ack.has(a.id));
  const full = alerts.data || [];
  const highCount = full.filter((a) => a.severity === "high").length;

  async function sendEmail() {
    setStatus({ kind: "loading", text: "Envoi en cours…" });
    try {
      const to = email.trim() || undefined;
      const url = to ? `${API}/alerts/email?to=${encodeURIComponent(to)}` : `${API}/alerts/email`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      const label = data.status === "sent" ? "E-mail envoyé ✓" : data.status === "mock" ? "Mode démo : e-mail sauvegardé ✓" : "Ignoré";
      setStatus({ kind: data.status === "error" ? "error" : "ok", text: `${label} (${data.reason || ""})` });
      const h = await fetch(`${API}/alerts/notifications`);
      setHistory(await h.json());
    } catch {
      setStatus({ kind: "error", text: "Échec de l'envoi." });
    }
  }

  function toggleCat(k) { setCats((c) => ({ ...c, [k]: !c[k] })); }

  useEffect(() => {
    fetch(`${API}/alerts/notifications`).then((r) => r.json()).then(setHistory).catch(() => {});
  }, []); // eslint-disable-line

  return (
    <div className="gridTwo">
      <div className="stack">
        <div className="panel">
          <div className="panelTitle">
            <div><h2>Toutes les alertes</h2><span>moteur BIAT · auto-actualisé (15s)</span></div>
            <span className="badge red">{full.length} signaux · {highCount} critiques</span>
          </div>

          <div className="alertFilters">
            <label>Sinistre &gt; {formatMoney(minClaim)}
              <input type="range" min="5000" max="80000" step="5000" value={minClaim} onChange={(e) => setMinClaim(Number(e.target.value))} className="slider" />
            </label>
            <label>Risque région &gt; {Math.round(minRisk * 100)}%
              <input type="range" min="0.3" max="0.9" step="0.02" value={minRisk} onChange={(e) => setMinRisk(Number(e.target.value))} className="slider" />
            </label>
            <div className="filterChips">
              {Object.keys(cats).map((k) => (
                <button key={k} className={`chip ${cats[k] ? "active" : ""}`} onClick={() => toggleCat(k)}>{k}</button>
              ))}
            </div>
          </div>

          <div className="alertList">
            {list.map((a, i) => (
              <div className={`alertRow ${a.severity === "high" ? "high" : ""} rowIn`} key={a.id || `${a.title}-${i}`} style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                <AlertTriangle size={16} className="alertIco" />
                <div className="alertMain">
                  <strong>{a.title}</strong>
                  <span>{a.type} · {a.severity}{a.impact != null ? ` · ${formatMoney(a.impact)}` : ""}</span>
                  {a.description && <p className="alertDesc">{a.description}</p>}
                </div>
                {a.client_id ? (
                  <button className="btn ghost alertGo" onClick={() => onOpenClient(a.client_id)}>Voir</button>
                ) : null}
                <button className="btn ghost alertGo" onClick={() => acknowledge(a.id)} title="Marquer comme traité">Traiter</button>
              </div>
            ))}
            {!list.length && <div className="emptyState"><AlertTriangle size={18} /><div><strong>{full.length ? "Tout est traité ✓" : "Aucune alerte"}</strong></div></div>}
          </div>
          {ack.size > 0 && (
            <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => { setAck(new Set()); try { localStorage.removeItem("biat_ack"); } catch { /* */ } }}>
              Réafficher {ack.size} traité(s)
            </button>
          )}
        </div>
      </div>

      <div className="stack">
        <div className="panel">
          <div className="panelTitle"><div><h2>Notification par e-mail</h2><span>alerte critique → boîte mail</span></div></div>
          <div className="composer">
            <input type="email" placeholder="destinataire@biat.tn" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn primary" style={{ width: "100%" }} onClick={sendEmail} disabled={status?.kind === "loading"}>
              {status?.kind === "loading" ? <Loader2 size={16} className="spin" /> : <MessageSquareText size={16} />}
              Envoyer le récapitulatif
            </button>
          </div>
          {status && (
            <div className={`notifStatus ${status.kind}`}>
              {status.kind === "ok" ? <Sparkles size={15} /> : status.kind === "error" ? <AlertTriangle size={15} /> : <Loader2 size={15} className="spin" />}
              {status.text}
            </div>
          )}
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Sans SMTP configuré, l'e-mail est généré et sauvegardé (mode démo). Renseignez SMTP_* dans <code>.env</code> pour un vrai envoi.
          </p>
        </div>

        <div className="panel">
          <div className="panelTitle"><div><h2>Historique des envois</h2></div></div>
          <div className="notifHistory">
            {history.length ? (
              history.map((h, i) => (
                <div className="rowItem" key={i}>
                  <div>
                    <strong>{h.to || "—"}</strong>
                    <span>{new Date(h.ts * 1000).toLocaleString("fr-FR")} · {h.alerts} alerte(s)</span>
                  </div>
                  <span className={`badge ${h.status === "sent" ? "teal" : h.status === "error" ? "red" : ""}`}>{h.status}</span>
                </div>
              ))
            ) : (
              <div className="emptyState"><MessageSquareText size={18} /><div><strong>Aucun envoi</strong><p>Les envois apparaîtront ici.</p></div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ PDF Chat ============ */
function PdfChatView({ apiUrl }) {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const chatRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    setError("");
    setFile(f);
    setPdfUrl(URL.createObjectURL(f));
    setMessages([]);
  };

  const ask = async () => {
    if (!file || !question.trim() || loading) return;
    setLoading(true);
    setError("");
    const q = question.trim();
    setMessages((p) => [...p, { role: "user", text: q }]);
    setQuestion("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("question", q);
      const res = await fetch(`${apiUrl}/pdf/chat`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((p) => [...p, { role: "assistant", text: data.answer || "Pas de réponse." }]);
    } catch (err) {
      setError(err.message || "Échec de la requête.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div className="pdfChatWrap">
      <div className="panel pdfPanel">
        <div className="panelTitle">
          <div>
            <h2>Lecteur PDF + IA</h2>
            <span>Uploadez un PDF et posez des questions</span>
          </div>
          {file && <span className="badge"><FileText size={14} /> {file.name}</span>}
        </div>

        <div className="pdfLayout">
          <div className="pdfViewer">
            <div className="pdfToolbar">
              <input type="file" accept="application/pdf" onChange={handleFile} ref={fileRef} aria-label="Sélectionner un PDF" />
              <button className="btn primary" onClick={() => fileRef.current?.click()}>
                <FileText size={16} /> {file ? "Changer de PDF" : "Choisir un PDF"}
              </button>
              {pdfUrl && (
                <a className="btn ghost" href={pdfUrl} download target="_blank" rel="noreferrer">
                  Télécharger
                </a>
              )}
            </div>
            {pdfUrl ? (
              <iframe src={pdfUrl} title="PDF Viewer" className="pdfFrame" />
            ) : (
              <div className="pdfEmpty">
                <FileText size={48} />
                <p>Aucun PDF sélectionné</p>
              </div>
            )}
          </div>

          <div className="pdfChat">
            <div className="chatLog" ref={chatRef}>
              {messages.length === 0 && (
                <div className="emptyState"><Bot size={18} /><div><strong>Prêt</strong><p>Uploadez un PDF puis posez une question.</p></div></div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`bubbleRow ${m.role === "user" ? "userRow" : "assistantRow"}`}>
                  {m.role === "assistant" && <div className="bubbleIco"><Bot size={16} /></div>}
                  <div className={`bubble ${m.role === "user" ? "userBubble" : "assistantBubble"}`}>{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="bubbleRow assistantRow">
                  <div className="bubbleIco"><Loader2 size={16} className="spin" /></div>
                  <div className="bubble assistantBubble">Analyse en cours…</div>
                </div>
              )}
            </div>
            {error && <div className="notifStatus error" style={{ marginTop: 10 }}>{error}</div>}
            <div className="composer">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Résume les points clés de ce document…"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(); }}
              />
              <button className="btn primary" onClick={ask} disabled={loading || !file}>
                <Search size={16} /> Interroger le PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
