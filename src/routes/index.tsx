import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDownAZ,
  ArrowUpAZ,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Download,
  FileSearch,
  Filter,
  Info,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fraud Triage Copilot | Fraud Operations" },
      {
        name: "description",
        content:
          "A rule-based fraud operations console for prioritizing risk, reviewing cases, and simulating loss prevented.",
      },
      { property: "og:title", content: "Fraud Triage Copilot | Fraud Operations" },
      {
        property: "og:description",
        content: "Operational fraud triage workspace with case-level risk scoring and loss prevention simulation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FraudTriageCopilot,
});

const CASE_TYPES = ["Card Fraud", "Wire Fraud", "Identity Theft"] as const;
const RISK_LEVELS = ["Low", "Medium", "High"] as const;
const STATUSES = ["New", "In Review", "Escalated", "Resolved"] as const;
type CaseType = (typeof CASE_TYPES)[number];
type RiskLevel = (typeof RISK_LEVELS)[number];
type CaseStatus = (typeof STATUSES)[number];
type SortOption = "risk-desc" | "risk-asc" | "amount-desc" | "amount-asc";

type Signal = {
  velocity: number;
  anomaly: number;
  mismatch: number;
  newPayee: number;
  transactionCount: number;
  windowMinutes: number;
  baselineAmount: number;
  device: string;
  location: string;
  recipient: string;
};

type FraudCase = {
  id: string;
  type: CaseType;
  customer: string;
  amount: number;
  riskScore: number;
  risk: RiskLevel;
  status: CaseStatus;
  openedAt: string;
  signal: Signal;
  narrative: string;
};

const customerNames = [
  "Dana Whitfield",
  "Priya Nandakumar",
  "Marcus Bell",
  "Sofia Reyes",
  "Tom Okafor",
  "Grace Lindqvist",
  "Harold Ng",
  "Elena Petrov",
  "Jonah Callahan",
  "Amina Yusuf",
  "Nora Sinclair",
  "Malcolm Reed",
  "Yuki Tanaka",
  "Camila Duarte",
  "Peter Hollis",
  "Renee Gardner",
  "Isaac Mensah",
  "Maya Chen",
  "Owen Fitzgerald",
  "Leila Haddad",
  "Anika Shah",
  "Caleb Morrison",
  "Hannah Vogel",
  "Darius Coleman",
  "Mei Brooks",
  "Victor Alvarez",
  "Tessa Morgan",
  "Andre Wallace",
  "Lucia Bianchi",
  "Ethan Park",
  "Irene Novak",
  "Noah Whitaker",
  "Farah Rahman",
  "Gavin Price",
  "Jasmine Cole",
  "Samuel Ortiz",
  "Lena Hoffman",
  "Ryan McKenna",
  "Alina Sethi",
  "Martin DeLuca",
  "Keisha Bryant",
  "Theo Armstrong",
  "Sabrina Flores",
  "Nick Carver",
  "Beatrice Wong",
  "Omar Rios",
  "Claire Donovan",
  "Jamal Turner",
  "Eva Laurent",
  "Benji Kramer",
];

const amountSeeds = [
  1240, 48200, 340, 9750, 680, 22400, 180, 560, 125000, 890, 3200, 7600, 450, 18400, 2750, 98500,
  190, 1420, 6700, 330, 54000, 2140, 820, 12750, 3800, 216000, 225, 490, 38900, 1120, 7350, 67000,
  1450, 270, 16400, 740, 29500, 2100, 6150, 940, 85000, 1680, 430, 19200, 5600, 148000, 300, 920, 27800,
  1250,
];

const signalProfiles = [
  [20, 18, 10],
  [68, 74, 62],
  [42, 51, 35],
  [88, 92, 84],
  [15, 24, 28],
  [55, 46, 57],
  [73, 81, 76],
  [28, 31, 18],
  [95, 65, 91],
  [36, 12, 44],
];

const statusSeeds: CaseStatus[] = ["Escalated", "In Review", "New", "Resolved", "New", "In Review", "Escalated", "Resolved", "New", "In Review"];
const locations = ["Austin, TX", "Chicago, IL", "Newark, NJ", "Denver, CO", "Seattle, WA", "Atlanta, GA", "Phoenix, AZ", "Boston, MA"];
const devices = ["Known iPhone", "New Android device", "Known browser", "Unrecognized device", "Known MacBook", "New Windows device"];

function getRisk(score: number): RiskLevel {
  if (score <= 33) return "Low";
  if (score <= 66) return "Medium";
  return "High";
}

function calculateScore(type: CaseType, signal: Signal) {
  return Math.round(
    signal.velocity * 0.3 +
      signal.anomaly * 0.3 +
      signal.mismatch * 0.25 +
      (type === "Wire Fraud" ? signal.newPayee * 0.15 : signal.anomaly * 0.15),
  );
}

function buildNarrative(index: number, type: CaseType, customer: string, amount: number, signal: Signal, risk: RiskLevel) {
  const amountText = formatCurrency(amount);
  const baselineMultiple = (amount / signal.baselineAmount).toFixed(1);
  const distanceText = signal.mismatch > 65 ? "outside the customer’s established region" : "near a previously seen operating region";
  const urgency = risk === "High" ? "The combined pattern warrants immediate analyst intervention." : risk === "Medium" ? "The activity merits a manual verification step before release." : "The activity is currently consistent enough to remain in pattern monitoring.";

  if (type === "Wire Fraud") {
    return `${customer} initiated a ${amountText} wire to ${signal.recipient}, ${signal.newPayee ? "a first-time recipient" : "an established recipient"}, after ${signal.transactionCount} transfer attempts in ${signal.windowMinutes} minutes. The amount is ${baselineMultiple}× the customer’s typical transfer baseline, and the activity originated from ${signal.device.toLowerCase()} ${distanceText}. ${urgency}`;
  }
  if (type === "Card Fraud") {
    return `${customer}’s card generated ${signal.transactionCount} purchase attempts totaling ${amountText} within a ${signal.windowMinutes}-minute window. That activity is ${baselineMultiple}× the customer’s typical transaction amount, with ${signal.device.toLowerCase()} activity observed from ${signal.location}. ${urgency}`;
  }
  return `${customer}’s identity profile triggered a ${amountText} account event after ${signal.transactionCount} verification attempts in ${signal.windowMinutes} minutes. The request is ${baselineMultiple}× the customer’s baseline profile activity and arrived from ${signal.device.toLowerCase()} in ${signal.location}. ${urgency}`;
}

function createCases(): FraudCase[] {
  return customerNames.map((customer, index) => {
    const type = CASE_TYPES[index % CASE_TYPES.length];
    const [velocityBase, anomalyBase, mismatchBase] = signalProfiles[index % signalProfiles.length];
    const velocity = Math.min(100, velocityBase + (type === "Wire Fraud" ? 4 : type === "Identity Theft" ? 2 : 0));
    const anomaly = Math.min(100, anomalyBase + (index % 4 === 0 ? 3 : 0));
    const mismatch = Math.min(100, mismatchBase + (index % 5 === 0 ? 4 : 0));
    const amount = amountSeeds[index];
    const baselineAmount = type === "Wire Fraud" ? [8000, 12000, 18000, 9500][index % 4] : type === "Card Fraud" ? [90, 140, 210, 75][index % 4] : [180, 260, 480, 120][index % 4];
    const signal: Signal = {
      velocity,
      anomaly,
      mismatch,
      newPayee: type === "Wire Fraud" && index % 3 !== 2 ? 100 : 0,
      transactionCount: 2 + ((index * 3) % 7),
      windowMinutes: 12 + ((index * 11) % 54),
      baselineAmount,
      device: devices[index % devices.length],
      location: locations[index % locations.length],
      recipient: ["Northstar Imports LLC", "Apex Renovation Group", "M. Alvarez", "Crescent Payroll", "Harborview Capital"][index % 5],
    };
    const riskScore = calculateScore(type, signal);
    const risk = getRisk(riskScore);
    return {
      id: `CASE-${1001 + index}`,
      type,
      customer,
      amount,
      riskScore,
      risk,
      status: statusSeeds[index % statusSeeds.length],
      openedAt: `${8 + (index % 10)}:${String((index * 7) % 60).padStart(2, "0")} ET`,
      signal,
      narrative: buildNarrative(index, type, customer, amount, signal, risk),
    };
  });
}

const mockCases = createCases();

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatFullCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatTime(date: Date | null) {
  if (!date) return "No updates yet";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", timeZoneName: "short" }).format(date);
}

function classForRisk(risk: RiskLevel) {
  return risk === "High" ? "risk-high" : risk === "Medium" ? "risk-medium" : "risk-low";
}

function classForStatus(status: CaseStatus) {
  return status === "Escalated" ? "status-escalated" : status === "In Review" ? "status-review" : status === "Resolved" ? "status-resolved" : "status-new";
}

function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

function MetricCard({ label, value, note, icon: Icon, emphasis }: { label: string; value: string; note: string; icon: typeof Activity; emphasis?: string }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between gap-3">
        <span className="metric-label">{label}</span>
        <Icon className={`size-4 ${emphasis ?? "text-muted-foreground"}`} strokeWidth={1.8} />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="metric-value">{value}</span>
      </div>
      <p className="metric-note">{note}</p>
    </div>
  );
}

function SignalBar({ label, weight, score, explanation }: { label: string; weight: string; score: number; explanation: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">{label} <span className="text-muted-foreground">{weight}</span></span>
        <span className="font-mono text-xs font-semibold text-foreground">{score}</span>
      </div>
      <div className="score-track"><span className="score-fill" style={{ "--bar-width": `${score}%` } as React.CSSProperties} /></div>
      <p className="text-[11px] leading-4 text-muted-foreground">{explanation}</p>
    </div>
  );
}

function FraudTriageCopilot() {
  const [selectedId, setSelectedId] = useState(mockCases[1]?.id ?? mockCases[0].id);
  const [statusById, setStatusById] = useState<Record<string, CaseStatus>>(() => Object.fromEntries(mockCases.map((item) => [item.id, item.status])));
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [catchRate, setCatchRate] = useState(70);
  const [typeFilter, setTypeFilter] = useState<CaseType | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("risk-desc");
  const [search, setSearch] = useState("");

  const cases = useMemo(() => mockCases.map((item) => ({ ...item, status: statusById[item.id] ?? item.status })), [statusById]);
  const openCases = cases.filter((item) => item.status !== "Resolved");
  const openHighRiskCases = openCases.filter((item) => item.risk === "High");
  const resolvedCases = cases.filter((item) => item.status === "Resolved");
  const highRiskExposure = openHighRiskCases.reduce((total, item) => total + item.amount, 0);
  const averageResolution = resolvedCases.length ? 4.8 + (resolvedCases.length % 4) * 0.7 : 0;

  const visibleCases = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return cases
      .filter((item) => typeFilter === "All" || item.type === typeFilter)
      .filter((item) => riskFilter === "All" || item.risk === riskFilter)
      .filter((item) => statusFilter === "All" || item.status === statusFilter)
      .filter((item) => !normalizedSearch || `${item.id} ${item.customer}`.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => {
        if (sortBy === "risk-asc") return a.riskScore - b.riskScore;
        if (sortBy === "amount-desc") return b.amount - a.amount;
        if (sortBy === "amount-asc") return a.amount - b.amount;
        return b.riskScore - a.riskScore;
      });
  }, [cases, riskFilter, search, sortBy, statusFilter, typeFilter]);

  const selectedCase = cases.find((item) => item.id === selectedId) ?? cases[0];
  const chartData = CASE_TYPES.map((type) => ({
    type,
    counts: RISK_LEVELS.map((risk) => cases.filter((item) => item.type === type && item.risk === risk).length),
  }));
  const caughtCount = openHighRiskCases.length * (catchRate / 100);
  const highestDollarHighRisk = [...openHighRiskCases].sort((a, b) => b.amount - a.amount).slice(0, Math.max(1, Math.ceil(caughtCount)));
  const lossPrevented = highestDollarHighRisk.reduce((total, item) => total + item.amount, 0) * (catchRate / 100);

  function updateStatus(nextStatus: CaseStatus) {
    if (!selectedCase || nextStatus === selectedCase.status) return;
    setStatusById((current) => ({ ...current, [selectedCase.id]: nextStatus }));
    setLastUpdated(new Date());
  }

  function exportCsv() {
    const headers = ["Case ID", "Case type", "Customer name", "Amount", "Risk score", "Risk segment", "Status"];
    const rows = visibleCases.map((item) => [item.id, item.type, item.customer, item.amount.toFixed(2), item.riskScore, item.risk, item.status]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "fraud-triage-cases.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!selectedCase) return null;

  const selectedPayeeLabel = selectedCase.type === "Wire Fraud" ? selectedCase.signal.newPayee : selectedCase.signal.anomaly;
  const recommendedAction = selectedCase.risk === "High" ? "Escalate to SIU + place temporary hold on account" : selectedCase.risk === "Medium" ? "Hold transaction pending manual verification call to customer" : "Clear — no action needed, log for pattern monitoring";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="app-header">
        <div className="app-shell flex min-h-[72px] items-center justify-between gap-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="brand-mark"><ShieldAlert className="size-5" strokeWidth={2.2} /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold tracking-tight">Fraud Triage Copilot</span>
                <span className="environment-chip">INTERNAL OPS</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Rule-based queue intelligence for fraud operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="metric-label">Last updated</div>
              <div className="font-mono text-xs text-foreground">{formatTime(lastUpdated)}</div>
            </div>
            <div className="header-divider" />
            <div className="flex items-center gap-2.5">
              <div className="analyst-avatar">MK</div>
              <div className="hidden leading-tight md:block">
                <div className="text-xs font-semibold">Maya Kessler</div>
                <div className="text-[11px] text-muted-foreground">Senior analyst</div>
              </div>
              <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
            </div>
          </div>
        </div>
      </header>

      <main className="app-shell space-y-5 py-6">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="eyebrow"><span className="live-dot" /> LIVE TRIAGE QUEUE</div>
            <h1 className="page-title mt-2">Prioritize what needs attention next.</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">50 simulated cases across card, wire, and identity fraud signals.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-4" /> Queue snapshot · 08:00–18:00 ET</div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Open cases" value={String(openCases.length)} note={`${cases.length} total in today’s sample`} icon={FileSearch} />
          <MetricCard label="High-risk cases" value={`${openHighRiskCases.length ? Math.round((openHighRiskCases.length / openCases.length) * 100) : 0}%`} note={`${openHighRiskCases.length} of ${openCases.length} open cases`} icon={ShieldAlert} emphasis="text-risk-high" />
          <MetricCard label="Dollar exposure" value={formatCurrency(highRiskExposure)} note="Open high-risk cases only" icon={AlertTriangle} emphasis="text-risk-high" />
          <MetricCard label="Avg. resolution" value={`${averageResolution.toFixed(1)}h`} note={`${resolvedCases.length} resolved cases in sample`} icon={Clock3} />
          <MetricCard label="Currently in review" value={String(openCases.filter((item) => item.status === "In Review").length)} note="Manual analyst workflow" icon={Activity} emphasis="text-accent" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="surface-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="section-kicker"><Activity className="size-3.5" /> DECISION SUPPORT</div>
                <h2 className="section-title mt-1.5">Fraud Loss Prevented Simulator</h2>
                <p className="mt-1 text-xs text-muted-foreground">Model the impact of catching more high-risk activity before funds are released.</p>
              </div>
              <span className="model-chip"><Sparkles className="size-3" /> What-if model</span>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-4 text-xs font-medium">
                  <span>Assumed catch rate on high-risk cases</span>
                  <span className="font-mono font-semibold text-accent">{catchRate}%</span>
                </div>
                <input aria-label="Assumed catch rate on high-risk cases" type="range" min="0" max="100" value={catchRate} onChange={(event) => setCatchRate(Number(event.target.value))} className="simulator-range" />
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground"><span>0%</span><span>50%</span><span>100%</span></div>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="sim-stat"><span>Cases caught</span><strong>{caughtCount.toFixed(1)}</strong></div>
                <div className="sim-stat"><span>Loss prevented</span><strong>{formatCurrency(lossPrevented)}</strong></div>
              </div>
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">Based on <span className="font-semibold text-foreground">{openHighRiskCases.length} high-risk cases</span> worth <span className="font-semibold text-foreground">{formatCurrency(highRiskExposure)}</span> in total exposure, assuming this team catches fraud at the selected rate before funds are released.</p>
          </div>

          <div className="surface-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="section-kicker"><BarChart3 className="size-3.5" /> PORTFOLIO VIEW</div>
                <h2 className="section-title mt-1.5">Risk by case type</h2>
              </div>
              <span className="text-xs text-muted-foreground">50 total cases</span>
            </div>
            <div className="mt-5 space-y-4">
              {chartData.map(({ type, counts }) => {
                const total = counts.reduce((sum, count) => sum + count, 0);
                return (
                  <div key={type}>
                    <div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium">{type}</span><span className="font-mono text-muted-foreground">{total}</span></div>
                    <div className="chart-track">
                      {counts.map((count, index) => <span key={RISK_LEVELS[index]} className={`chart-segment ${classForRisk(RISK_LEVELS[index])}`} style={{ "--bar-width": `${total ? (count / total) * 100 : 0}%` } as React.CSSProperties} />)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
              {RISK_LEVELS.map((risk) => <span key={risk} className="flex items-center gap-1.5"><span className={`legend-dot ${classForRisk(risk)}`} />{risk}</span>)}
            </div>
          </div>
        </section>

        <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="section-kicker"><Filter className="size-3.5" /> WORK QUEUE</div>
                <div className="mt-1 flex items-baseline gap-2"><h2 className="section-title">Case queue</h2><span className="count-chip">{visibleCases.length} shown</span></div>
              </div>
              <Button variant="default" size="sm" onClick={exportCsv}><Download className="size-3.5" /> Export to CSV</Button>
            </div>
            <div className="filter-bar">
              <div className="relative min-w-[170px] flex-1">
                <FileSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input aria-label="Search cases" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search case ID or customer" className="filter-input pl-9" />
              </div>
              <FilterSelect label="Type" value={typeFilter} onChange={(value) => setTypeFilter(value as CaseType | "All")} options={["All", ...CASE_TYPES]} />
              <FilterSelect label="Risk" value={riskFilter} onChange={(value) => setRiskFilter(value as RiskLevel | "All")} options={["All", ...RISK_LEVELS]} />
              <FilterSelect label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as CaseStatus | "All")} options={["All", ...STATUSES]} />
              <label className="filter-select-wrap"><span className="sr-only">Sort cases</span><select aria-label="Sort cases" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="filter-select"><option value="risk-desc">Risk score ↓</option><option value="risk-asc">Risk score ↑</option><option value="amount-desc">Amount ↓</option><option value="amount-asc">Amount ↑</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /></label>
            </div>

            <div className="table-panel mt-3">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <thead><tr className="table-head-row"><th>Case ID</th><th>Type</th><th>Customer</th><th className="text-right">Amount</th><th className="text-right">Score</th><th>Segment</th><th>Status</th></tr></thead>
                  <tbody>
                    {visibleCases.map((item) => (
                      <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`table-row ${selectedCase.id === item.id ? "table-row-selected" : ""}`}>
                        <td className="font-mono text-xs font-semibold text-accent">{item.id}</td>
                        <td><span className="type-badge">{item.type}</span></td>
                        <td className="font-medium text-foreground">{item.customer}</td>
                        <td className="text-right font-mono text-xs">{formatFullCurrency(item.amount)}</td>
                        <td className="text-right"><span className={`score-number ${classForRisk(item.risk)}`}>{item.riskScore}</span></td>
                        <td><Badge tone={classForRisk(item.risk)}>{item.risk}</Badge></td>
                        <td><Badge tone={classForStatus(item.status)}>{item.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleCases.length === 0 && <div className="empty-state"><FileSearch className="size-5" /><p>No cases match the current filters.</p></div>}
              </div>
              <div className="table-footer"><span>Showing {visibleCases.length} of {cases.length} cases</span><span className="font-mono">Select a row to inspect</span></div>
            </div>
          </div>

          <aside className="detail-panel lg:sticky lg:top-5">
            <div className="detail-header">
              <div><div className="section-kicker">SELECTED CASE</div><div className="mt-1 font-mono text-sm font-semibold">{selectedCase.id}</div></div>
              <button aria-label="Close case details" className="icon-button lg:hidden" onClick={() => setSelectedId(visibleCases[0]?.id ?? selectedCase.id)}><X className="size-4" /></button>
            </div>
            <div className="detail-body">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-lg font-semibold tracking-tight">{selectedCase.customer}</h2><p className="mt-1 text-xs text-muted-foreground">{selectedCase.type} · opened {selectedCase.openedAt}</p></div>
                <Badge tone={classForRisk(selectedCase.risk)}>{selectedCase.risk} risk</Badge>
              </div>
              <div className="detail-facts"><div><span>Amount</span><strong>{formatFullCurrency(selectedCase.amount)}</strong></div><div><span>Risk score</span><strong className={classForRisk(selectedCase.risk)}>{selectedCase.riskScore} / 100</strong></div></div>

              <div className="detail-section"><div className="detail-section-heading"><h3>Why this score</h3><span className="rule-chip"><Info className="size-3" /> Rule-based</span></div><div className="mt-3 space-y-4">
                <SignalBar label="Transaction velocity" weight="· 30%" score={selectedCase.signal.velocity} explanation={`${selectedCase.signal.transactionCount} attempts in ${selectedCase.signal.windowMinutes} minutes.`} />
                <SignalBar label="Anomaly vs. customer baseline" weight="· 30%" score={selectedCase.signal.anomaly} explanation={`${formatFullCurrency(selectedCase.signal.baselineAmount)} typical baseline; current amount is ${ (selectedCase.amount / selectedCase.signal.baselineAmount).toFixed(1) }× higher.`} />
                <SignalBar label="Device / location mismatch" weight="· 25%" score={selectedCase.signal.mismatch} explanation={`${selectedCase.signal.device} observed in ${selectedCase.signal.location}.`} />
                <SignalBar label={selectedCase.type === "Wire Fraud" ? "New payee / recipient flag" : "New payee flag · folded into anomaly"} weight="· 15%" score={selectedPayeeLabel} explanation={selectedCase.type === "Wire Fraud" ? (selectedCase.signal.newPayee ? `First transfer to ${selectedCase.signal.recipient}.` : `Recipient ${selectedCase.signal.recipient} is established.`) : "For card and identity cases, this weight is included in the anomaly signal."} />
              </div></div>

              <div className="summary-callout"><div className="callout-heading"><Sparkles className="size-3.5" /> AI Case Summary</div><p>{selectedCase.narrative}</p></div>

              <div className={`action-card ${classForRisk(selectedCase.risk)}`}><div className="callout-heading"><AlertTriangle className="size-3.5" /> Recommended action</div><p className="mt-1.5 text-sm font-semibold text-foreground">{recommendedAction}</p>{selectedCase.risk === "High" && <div className="mt-3 space-y-2">{["Freeze affected account", "Escalate to SIU queue", "Notify customer via verified contact method"].map((item, index) => <label key={item} className="check-row"><input type="checkbox" defaultChecked={index === 1} /><span>{item}</span></label>)}</div>}</div>

              <div className="detail-section"><div className="detail-section-heading"><h3>Case status</h3><span className="text-[11px] text-muted-foreground">{lastUpdated ? `Updated ${formatTime(lastUpdated)}` : "No updates yet"}</span></div><div className="status-selector mt-3">{STATUSES.map((status) => <button key={status} onClick={() => updateStatus(status)} className={`status-option ${selectedCase.status === status ? `active ${classForStatus(status)}` : ""}`}>{selectedCase.status === status && <Check className="size-3" />}{status}</button>)}</div><p className="mt-2 text-[11px] leading-4 text-muted-foreground">Status changes apply to this session and update the queue metrics above.</p></div>
            </div>
          </aside>
        </section>

        <section className="surface-panel p-5">
          <div className="flex items-start justify-between gap-4"><div><div className="section-kicker"><CircleHelp className="size-3.5" /> SCORING MODEL</div><h2 className="section-title mt-1.5">How the risk score works</h2><p className="mt-1 text-xs text-muted-foreground">Each case is scored from 0–100 using transparent rules tailored to the case type.</p></div><span className="model-chip">100 point scale</span></div>
          <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
            {[["Transaction velocity", "30%", "Number of transactions or attempts in a short window, normalized against account norms."], ["Anomaly vs. baseline", "30%", "How far the amount or behavior deviates from the customer’s typical pattern."], ["Device / location mismatch", "25%", "New device, IP, or geography inconsistent with the customer’s history."], ["New payee / recipient flag", "15%", "Wire transfers: first-time recipient scored 0 or 100. For card and identity cases, this weight is folded into anomaly."]].map(([title, weight, description]) => <div key={title} className="method-card"><div className="flex items-center justify-between gap-2"><h3>{title}</h3><span className="font-mono text-xs font-semibold text-accent">{weight}</span></div><p>{description}</p></div>)}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-xs"><span className="font-semibold">Score bands</span><span className="flex items-center gap-2"><span className="legend-dot risk-low" /><strong>0–33</strong> Low · clear and monitor</span><span className="flex items-center gap-2"><span className="legend-dot risk-medium" /><strong>34–66</strong> Medium · hold and verify</span><span className="flex items-center gap-2"><span className="legend-dot risk-high" /><strong>67–100</strong> High · escalate and hold</span></div>
        </section>
      </main>
      <footer className="app-footer"><div className="app-shell flex flex-wrap items-center justify-between gap-2 py-4"><span>Fraud Triage Copilot · Mock operations environment</span><span>Data is simulated for product management portfolio review</span></div></footer>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return <label className="filter-select-wrap"><span className="sr-only">Filter by {label}</span><select aria-label={`Filter by ${label}`} value={value} onChange={(event) => onChange(event.target.value)} className="filter-select"><option value="All">{label}: All</option>{options.filter((option) => option !== "All").map((option) => <option key={option} value={option}>{label}: {option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /></label>;
}