import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  CloudLightning,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const colors = ["#005baa", "#e31b23", "#12a39a", "#f2a900", "#4b587c", "#7c3f58"];

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(value || 0);
}

function useApi(path, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}${path}`);
      setData(await res.json());
    } catch {
      setData(fallback);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [path]);
  return { data, loading, load };
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="stat">
      <div className={`statIcon ${tone}`}><Icon size={18} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function PanelTitle({ title, subtitle }) {
  return (
    <div className="panelTitle">
      <h2>{title}</h2>
      <span>{subtitle}</span>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const summary = useApi("/dashboard/summary", {});
  const charts = useApi("/dashboard/charts", { products: [], cities: [], payments: [], claims: [] });
  const alerts = useApi("/alerts", []);
  const [clientId, setClientId] = useState(1);
  const [client, setClient] = useState(null);
  const [question, setQuestion] = useState("Quels clients BIAT Assurance ont un risque de résiliation élevé et quelles actions proposer ?");
  const [answer, setAnswer] = useState(null);
  const [risk, setRisk] = useState(null);

  const premiumSeries = useMemo(() => {
    return charts.data.products.map((item, index) => ({
      name: item.name.replace("ProductType.", ""),
      premium: item.premium,
      contracts: item.contracts,
      fill: colors[index % colors.length]
    }));
  }, [charts.data]);

  const views = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "rag", label: "Assistant RAG", icon: Bot },
    { id: "sales", label: "Sales Copilot", icon: BriefcaseBusiness },
    { id: "risk", label: "Risk Exposure", icon: CloudLightning },
    { id: "client", label: "Client 360", icon: UserRound }
  ];

  async function loadClient() {
    const res = await fetch(`${API}/clients/${clientId}/360`);
    setClient(await res.json());
  }

  async function askCopilot() {
    const res = await fetch(`${API}/rag/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, client_id: Number(clientId) || null })
    });
    setAnswer(await res.json());
  }

  async function simulate(event_type) {
    const res = await fetch(`${API}/risk/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type, severity: 0.68 })
    });
    setRisk(await res.json());
  }

  useEffect(() => {
    loadClient();
  }, []);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark"><ShieldCheck size={22} /></div>
          <div><strong>BIAT Assurance</strong><span>AI Copilot</span></div>
        </div>
        <nav>
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button key={view.id} className={activeView === view.id ? "active" : ""} onClick={() => setActiveView(view.id)}>
                <Icon size={18} /> {view.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebarNote">
          <Sparkles size={16} />
          <p>Poste de pilotage IA pour portefeuille, agences et clients à risque.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>BIAT Assurance · démonstration data driven</p>
            <h1>{views.find((view) => view.id === activeView)?.label}</h1>
          </div>
          <button onClick={() => { summary.load(); charts.load(); alerts.load(); loadClient(); }}>
            <RefreshCcw size={16} /> Actualiser
          </button>
        </header>

        <section className="heroStrip">
          <Building2 size={22} />
          <div>
            <strong>Une console métier, pas une vitrine.</strong>
            <span>Chaque action lit la base, calcule un signal et aide un conseiller à décider plus vite.</span>
          </div>
        </section>

        {activeView === "dashboard" && (
          <>
            <section className="statsGrid">
              <Stat icon={UserRound} label="Clients" value={summary.data.clients || 0} tone="blue" />
              <Stat icon={BriefcaseBusiness} label="Contrats" value={summary.data.contracts || 0} tone="red" />
              <Stat icon={CircleDollarSign} label="Revenus encaissés" value={formatMoney(summary.data.paid_revenue)} tone="teal" />
              <Stat icon={AlertTriangle} label="Churn estimé" value={`${Math.round((summary.data.churn_rate || 0) * 100)}%`} tone="gold" />
            </section>

            <section className="gridTwo">
              <div className="panel large">
                <PanelTitle title="Production par produit" subtitle="Primes et contrats" />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={premiumSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d9e0e8" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => name === "premium" ? formatMoney(value) : value} />
                    <Legend />
                    <Bar dataKey="premium" name="Prime totale" radius={[5, 5, 0, 0]}>
                      {premiumSeries.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <AlertsPanel alerts={alerts.data} />
            </section>

            <section className="gridThree">
              <ClaimsChart claims={charts.data.claims} />
              <CitiesChart cities={charts.data.cities} />
              <RiskCard risk={risk} simulate={simulate} />
            </section>
          </>
        )}

        {activeView === "rag" && <RagView question={question} setQuestion={setQuestion} answer={answer} askCopilot={askCopilot} />}
        {activeView === "sales" && <SalesView client={client} clientId={clientId} setClientId={setClientId} loadClient={loadClient} />}
        {activeView === "risk" && <RiskView risk={risk} simulate={simulate} alerts={alerts.data} />}
        {activeView === "client" && <ClientView client={client} clientId={clientId} setClientId={setClientId} loadClient={loadClient} />}
      </section>
    </main>
  );
}

function AlertsPanel({ alerts }) {
  return (
    <div className="panel">
      <PanelTitle title="Alertes intelligentes" subtitle="Priorisation IA" />
      <div className="alertList">
        {alerts.slice(0, 7).map((alert, index) => (
          <div className="alert" key={`${alert.title}-${index}`}>
            <AlertTriangle size={16} />
            <div><strong>{alert.title}</strong><span>{alert.type} / {alert.severity}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClaimsChart({ claims }) {
  return (
    <div className="panel">
      <PanelTitle title="Sinistres" subtitle="Montants par produit" />
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie data={claims} dataKey="amount" nameKey="name" innerRadius={48} outerRadius={82}>
            {claims.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function CitiesChart({ cities }) {
  return (
    <div className="panel">
      <PanelTitle title="Carte commerciale" subtitle="Clients par ville" />
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={cities}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d9e0e8" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="clients" stroke="#005baa" fill="#dbeafe" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RiskCard({ risk, simulate }) {
  return (
    <div className="panel">
      <PanelTitle title="Simulation catastrophe" subtitle="Stress test" />
      <div className="riskButtons">
        <button onClick={() => simulate("inondation")}>Inondation</button>
        <button onClick={() => simulate("tempete")}>Tempête</button>
        <button onClick={() => simulate("seisme")}>Séisme</button>
      </div>
      <div className="riskResult">
        <strong>{risk ? formatMoney(risk.estimated_loss) : formatMoney(0)}</strong>
        <span>{risk ? `${risk.affected_contracts} contrats affectés` : "Lancez une simulation"}</span>
      </div>
    </div>
  );
}

function RagView({ question, setQuestion, answer, askCopilot }) {
  return (
    <section className="gridTwo">
      <div className="panel large">
        <PanelTitle title="Assistant RAG BIAT" subtitle="Recherche hybride avec citations" />
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button className="primary" onClick={askCopilot}><Search size={16} /> Interroger</button>
        {answer && (
          <div className="answer">
            <p>{answer.answer}</p>
            {answer.citations.map((c) => <span key={c.source}>{c.title} · {c.source} · {Math.round(c.score * 100)}%</span>)}
          </div>
        )}
      </div>
      <div className="panel">
        <PanelTitle title="Mode conseiller" subtitle="Réponse vérifiable" />
        <div className="humanNote">
          <strong>Ton attendu</strong>
          <p>Une réponse courte, utile, sourcée, avec l’action suivante pour le conseiller en agence.</p>
        </div>
      </div>
    </section>
  );
}

function SalesView({ client, clientId, setClientId, loadClient }) {
  return (
    <section className="gridTwo">
      <ClientSearch client={client} clientId={clientId} setClientId={setClientId} loadClient={loadClient} />
      <div className="panel">
        <PanelTitle title="Recommandations" subtitle="Cross-selling temps réel" />
        <div className="recos vertical">
          {(client?.recommendations || []).map((rec) => (
            <span key={rec.product}>{rec.product} · {Math.round(rec.score * 100)}% · {rec.reason}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function RiskView({ risk, simulate, alerts }) {
  return (
    <section className="gridTwo">
      <RiskCard risk={risk} simulate={simulate} />
      <AlertsPanel alerts={alerts.filter((alert) => alert.type === "risk" || alert.type === "claim")} />
    </section>
  );
}

function ClientView({ client, clientId, setClientId, loadClient }) {
  return (
    <section className="gridTwo">
      <ClientSearch client={client} clientId={clientId} setClientId={setClientId} loadClient={loadClient} />
      <div className="panel">
        <PanelTitle title="Contrats actifs" subtitle="Portefeuille client" />
        <div className="contractList">
          {(client?.contracts || []).map((contract) => (
            <div key={contract.id} className="contractRow">
              <strong>{contract.product}</strong>
              <span>{formatMoney(contract.coverage_amount)} · risque {Math.round(contract.risk * 100)}% · {contract.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientSearch({ client, clientId, setClientId, loadClient }) {
  return (
    <div className="panel">
      <PanelTitle title="Client 360" subtitle="Churn et contexte" />
      <div className="clientSearch">
        <input type="number" value={clientId} min="1" onChange={(e) => setClientId(e.target.value)} />
        <button onClick={loadClient}>Charger</button>
      </div>
      {client?.client && (
        <div className="clientBox">
          <h3>{client.client.full_name}</h3>
          <p>{client.client.email} · {client.client.city} · {client.client.segment}</p>
          <div className="churn"><strong>Churn {Math.round(client.churn.score * 100)}%</strong><span>{client.churn.level}</span></div>
          <div className="recos">
            {client.churn.factors.map((factor) => <span key={factor.factor}>{factor.factor} · {Math.round(factor.impact * 100)} pts</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
