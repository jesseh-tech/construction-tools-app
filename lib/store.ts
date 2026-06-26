// Shared project store — ported from the Claude Design `tencent-store.js`.
// One "job" is the single source of truth; every tool reads/writes it, so an
// estimate edit flows through to the SOV, proposal, change orders, pay app, and
// dashboard. Client + server safe (no browser/server-only imports here).

export type LineItem = {
  id: string;
  desc: string;
  qty: number;
  unit: string;
  m: number; // material $/unit
  l: number; // labor $/unit
  e: number; // equipment $/unit
  s: number; // subcontractor $/unit
};

export type Division = {
  id: string;
  code: string;
  name: string;
  collapsed: boolean;
  items: LineItem[];
};

export type Meta = {
  name: string;
  client: string;
  bidNo: string;
  location: string;
  sf: number;
  dueLabel: string;
};

export type Markups = { ins: number; oh: number; cont: number; profit: number };

export type ChangeOrder = {
  id: string;
  no: string;
  date: string;
  desc: string;
  status: "pending" | "approved" | "rejected";
  amount: number;
};

export type Proposal = { date: string; validDays: string; preparedBy: string; intro: string; inclusions: string; exclusions: string };
export type BlScope = { id: string; label: string };
export type BlSub = { id: string; name: string; prices: Record<string, string> };
export type BidLeveling = { trade: string; scope: BlScope[]; subs: BlSub[] };

export type TrackItem = { id: string; refNo: string; title: string; court: string; due: string; status: string };
export type Crew = { id: string; company: string; count: string; hours: string };
export type DailyReport = { id: string; date: string; weather: string; temp: string; delays: string; crews: Crew[]; work: string; notes: string };

export type Job = {
  meta: Meta;
  markups: Markups;
  divisions: Division[];
  changeOrders: ChangeOrder[];
  billing: { retainage: number; pct: Record<string, number> };
  payapp: { appNo: string; periodTo: string; priorPct: number };
  proposal: Proposal;
  bidLeveling: BidLeveling | null;
  rfis: TrackItem[];
  submittals: TrackItem[];
  dailyReports: DailyReport[];
};

export const proposalDefaults = (): Proposal => ({
  date: "",
  validDays: "30",
  preparedBy: "Estimating Department",
  intro:
    "10 Cent Investments is pleased to submit the following lump-sum proposal for the above-referenced commercial tenant improvement. The pricing below is based on the drawings and specifications available at time of bid and reflects a complete scope across the CSI divisions noted.",
  inclusions:
    "• All labor, material, equipment & supervision for the divisions listed\n• General conditions, project management & cleanup\n• Builder's risk and general liability insurance\n• Permits as required by jurisdiction\n• One-year workmanship warranty",
  exclusions:
    "• Hazardous material abatement or testing\n• Owner-furnished furniture, fixtures & equipment\n• After-hours / overtime work unless noted\n• Off-site improvements & utility company fees\n• Design & engineering fees",
});

export function bidLevelingDefaults(): BidLeveling {
  const s1 = newId(), s2 = newId(), s3 = newId(), s4 = newId();
  return {
    trade: "Division 09 — Drywall, ACT & Paint",
    scope: [
      { id: s1, label: "Metal-stud framing & GWB partitions" },
      { id: s2, label: "Acoustical ceiling — grid & tile" },
      { id: s3, label: "Tape, finish & paint" },
      { id: s4, label: "Mobilization, GC's & cleanup" },
    ],
    subs: [
      { id: newId(), name: "Summit Interiors", prices: { [s1]: "48200", [s2]: "22400", [s3]: "31600", [s4]: "8500" } },
      { id: newId(), name: "Front Range Drywall", prices: { [s1]: "45800", [s2]: "24100", [s3]: "29900", [s4]: "7200" } },
      { id: newId(), name: "Apex Wall Systems", prices: { [s1]: "51000", [s2]: "21800", [s3]: "33200", [s4]: "" } },
    ],
  };
}

export const UNITS = ["EA", "SF", "LF", "SY", "CY", "LS", "HR", "TON", "LB", "GAL"] as const;

export const CSI_CATALOG: [string, string][] = [
  ["00", "Procurement & Contracting Requirements"],
  ["01", "General Requirements"],
  ["02", "Existing Conditions"],
  ["03", "Concrete"],
  ["04", "Masonry"],
  ["05", "Metals"],
  ["06", "Wood, Plastics & Composites"],
  ["07", "Thermal & Moisture Protection"],
  ["08", "Openings"],
  ["09", "Finishes"],
  ["10", "Specialties"],
  ["11", "Equipment"],
  ["12", "Furnishings"],
  ["13", "Special Construction"],
  ["14", "Conveying Equipment"],
  ["21", "Fire Suppression"],
  ["22", "Plumbing"],
  ["23", "Heating, Ventilating & Air Conditioning (HVAC)"],
  ["25", "Integrated Automation"],
  ["26", "Electrical"],
  ["27", "Communications"],
  ["28", "Electronic Safety & Security"],
  ["31", "Earthwork"],
  ["32", "Exterior Improvements"],
  ["33", "Utilities"],
  ["34", "Transportation"],
  ["35", "Waterway & Marine Construction"],
  ["40", "Process Interconnections"],
  ["41", "Material Processing & Handling Equipment"],
  ["42", "Process Heating, Cooling & Drying Equipment"],
  ["43", "Process Gas & Liquid Handling, Purification & Storage Equipment"],
  ["44", "Pollution & Waste Control Equipment"],
  ["45", "Industry-Specific Manufacturing Equipment"],
  ["46", "Water & Wastewater Equipment"],
  ["48", "Electric Power Generation"],
];

export const csiName = (code: string): string =>
  CSI_CATALOG.find(([c]) => c === code)?.[1] ?? "Custom Division";

export type AppPhase = "PRECONSTRUCTION" | "PROJECT CONTROLS" | "FIELD";

export type AppEntry = {
  id: string;
  route: string;
  no: string;
  name: string;
  tag: AppPhase;
  active: boolean;
  desc: string;
  feeds: string;
};

// Tool registry — single source for the dashboard tiles + nav. `route` is the
// in-app path; `active` flips on as each tool gets built.
export const APPS: AppEntry[] = [
  { id: "estimate", route: "/estimate", no: "01", name: "Estimate Worksheet", tag: "PRECONSTRUCTION", active: true, desc: "Unit-price takeoff across CSI divisions. The cost source of truth.", feeds: "Feeds every tool" },
  { id: "sov", route: "/sov", no: "02", name: "Schedule of Values", tag: "PRECONSTRUCTION", active: true, desc: "AIA-style billing breakdown by division, built from the estimate.", feeds: "From Estimate" },
  { id: "proposal", route: "/proposal", no: "03", name: "Bid Proposal", tag: "PRECONSTRUCTION", active: true, desc: "Client-facing proposal & cover sheet, priced from the estimate.", feeds: "From Estimate" },
  { id: "leveling", route: "/bid-leveling", no: "04", name: "Bid Leveling", tag: "PRECONSTRUCTION", active: true, desc: "Compare subcontractor bids side by side and spot scope gaps.", feeds: "Standalone" },
  { id: "takeoff", route: "/takeoff", no: "05", name: "Quantity Takeoff", tag: "PRECONSTRUCTION", active: true, desc: "Calculate material quantities and push them into the estimate.", feeds: "To Estimate" },
  { id: "changeorders", route: "/change-orders", no: "06", name: "Change Order Log", tag: "PROJECT CONTROLS", active: true, desc: "Track COs and adjust the contract value live.", feeds: "Adjusts contract" },
  { id: "payapp", route: "/pay-app", no: "07", name: "Pay Application", tag: "PROJECT CONTROLS", active: true, desc: "G702/G703 monthly draw with retainage, from SOV + change orders.", feeds: "From SOV + COs" },
  { id: "submittals", route: "/submittals", no: "08", name: "Submittals & RFIs", tag: "PROJECT CONTROLS", active: true, desc: "Log submittals and RFIs with status and ball-in-court.", feeds: "Standalone" },
  { id: "daily", route: "/daily-report", no: "09", name: "Daily Field Report", tag: "FIELD", active: true, desc: "Weather, crew, work performed and photos from the field.", feeds: "Standalone" },
];

// ---- math ----
const n = (v: unknown): number => {
  const x = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(x) ? x : 0;
};

export type ComputedDivision = {
  ref: Division;
  code: string;
  name: string;
  m: number; l: number; e: number; s: number;
  subtotal: number;
  items: { ref: LineItem; total: number }[];
};

export type Computed = {
  mat: number; lab: number; eq: number; sub: number; direct: number;
  ins: number; oh: number; basis: number; cont: number; profit: number; total: number;
  coApproved: number; coPending: number; adjustedContract: number;
  margin: number; perSF: number; lineCount: number; divCount: number;
  matPct: number; labPct: number; eqPct: number; subPct: number;
  divisions: ComputedDivision[];
};

export function compute(p: Job): Computed {
  let mat = 0, lab = 0, eq = 0, sub = 0;
  const divisions: ComputedDivision[] = (p.divisions || []).map((d) => {
    let dm = 0, dl = 0, de = 0, ds = 0;
    const items = (d.items || []).map((li) => {
      const q = n(li.qty);
      const im = q * n(li.m), il = q * n(li.l), ie = q * n(li.e), is = q * n(li.s);
      dm += im; dl += il; de += ie; ds += is;
      return { ref: li, total: im + il + ie + is };
    });
    mat += dm; lab += dl; eq += de; sub += ds;
    return { ref: d, code: d.code, name: d.name, m: dm, l: dl, e: de, s: ds, subtotal: dm + dl + de + ds, items };
  });
  const direct = mat + lab + eq + sub;
  const ins = (direct * n(p.markups.ins)) / 100;
  const oh = (direct * n(p.markups.oh)) / 100;
  const basis = direct + ins + oh;
  const cont = (basis * n(p.markups.cont)) / 100;
  const pre = basis + cont;
  const profit = (pre * n(p.markups.profit)) / 100;
  const total = pre + profit;

  const coApproved = (p.changeOrders || []).reduce((a, c) => a + (c.status === "approved" ? n(c.amount) : 0), 0);
  const coPending = (p.changeOrders || []).reduce((a, c) => a + (c.status === "pending" ? n(c.amount) : 0), 0);
  const sf = n(p.meta.sf) || 1;
  const lineCount = divisions.reduce((a, d) => a + d.items.length, 0);
  const pct = (x: number) => (direct > 0 ? (x / direct) * 100 : 0);

  return {
    mat, lab, eq, sub, direct, ins, oh, basis, cont, profit, total,
    coApproved, coPending, adjustedContract: total + coApproved,
    margin: total > 0 ? (profit / total) * 100 : 0,
    perSF: total / sf, lineCount, divCount: divisions.length,
    matPct: pct(mat), labPct: pct(lab), eqPct: pct(eq), subPct: pct(sub),
    divisions,
  };
}

export function money(v: number, cents = false): string {
  const x = n(v), neg = x < 0, a = Math.abs(x);
  const str = cents
    ? a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(a).toLocaleString("en-US");
  return (neg ? "-$" : "$") + str;
}
export const money0 = (v: number) => money(v, false);
export const money2 = (v: number) => money(v, true);

// ---- billing (SOV + Pay App share this) ----
// Scheduled values are the estimate's division subtotals grossed up to the total
// bid price (cost + markups). % complete per division builds the draw.
export type SovRow = { id: string; code: string; name: string; sched: number; pct: number; completed: number; balance: number; retain: number };
export type Sov = { rows: SovRow[]; schedTotal: number; completedTotal: number; retainTotal: number; balanceTotal: number; pctBilled: number };

export function sov(job: Job, c: Computed = compute(job)): Sov {
  const ratio = c.direct > 0 ? c.total / c.direct : 1;
  const retPct = n(job.billing.retainage);
  let completedTotal = 0, retainTotal = 0;
  const rows: SovRow[] = c.divisions.map((d) => {
    const id = d.ref.id;
    const sched = d.subtotal * ratio;
    let pct = n(job.billing.pct[id]);
    pct = Math.max(0, Math.min(100, pct));
    const completed = (sched * pct) / 100;
    const retain = (completed * retPct) / 100;
    completedTotal += completed;
    retainTotal += retain;
    return { id, code: d.code, name: d.name, sched, pct, completed, balance: sched - completed, retain };
  });
  return {
    rows, schedTotal: c.total, completedTotal, retainTotal,
    balanceTotal: c.total - completedTotal,
    pctBilled: c.total > 0 ? (completedTotal / c.total) * 100 : 0,
  };
}

// ---- seed (Westgate Tower demo) ----
let _sid = 0;
const sid = () => `seed-${_sid++}`;
const it = (desc: string, qty: number, unit: string, m: number, l: number, e: number, s: number): LineItem =>
  ({ id: sid(), desc, qty, unit, m, l, e, s });
const dv = (code: string, name: string, items: LineItem[]): Division =>
  ({ id: sid(), code, name, collapsed: false, items });

export function seedJob(): Job {
  const divisions = [
    dv("02", "Existing Conditions", [
      it("Selective demolition — interior partitions", 240, "LF", 0, 12, 3, 0),
      it("Floor finish removal & substrate prep", 8500, "SF", 0, 0.85, 0.15, 0),
      it("Acoustical ceiling grid & tile removal", 8500, "SF", 0, 0.45, 0, 0),
      it("Debris haul-off & dumpster service", 6, "LS", 0, 0, 0, 650),
    ]),
    dv("03", "Concrete", [
      it("Slab infill at abandoned penetrations", 120, "SF", 6.5, 9, 1.5, 0),
      it("Core drilling — floor penetrations", 14, "EA", 0, 0, 0, 185),
    ]),
    dv("06", "Wood, Plastics & Composites", [
      it("Blocking & rough carpentry", 8500, "SF", 0.35, 0.55, 0, 0),
      it("Plastic-laminate casework — break room", 28, "LF", 145, 65, 0, 0),
      it("Solid-surface countertops", 42, "SF", 0, 0, 0, 78),
    ]),
    dv("08", "Openings", [
      it("Solid-core wood doors w/ frames", 22, "EA", 685, 145, 0, 0),
      it("Aluminum-framed glass office fronts", 6, "EA", 0, 0, 0, 2850),
      it("Door hardware sets — ADA compliant", 22, "EA", 245, 45, 0, 0),
    ]),
    dv("09", "Finishes", [
      it("Metal-stud framing & GWB partitions", 4200, "SF", 1.85, 2.65, 0.2, 0),
      it("Acoustical ceiling — grid & tile", 8500, "SF", 1.45, 1.35, 0, 0),
      it("Carpet tile — offices & corridors", 6800, "SF", 3.25, 1.1, 0, 0),
      it("Luxury vinyl tile — break & copy", 1700, "SF", 3.85, 1.35, 0, 0),
      it("Paint — walls & ceilings", 4200, "SF", 0.45, 0.85, 0, 0),
      it("Rubber wall base", 1450, "LF", 1.15, 0.9, 0, 0),
    ]),
    dv("22", "Plumbing", [
      it("Break-room sink & connections", 1, "LS", 0, 0, 0, 2450),
      it("Point-of-use water heaters", 2, "EA", 0, 0, 0, 1150),
      it("ADA restroom fixture upgrades", 1, "LS", 0, 0, 0, 5800),
    ]),
    dv("23", "HVAC", [
      it("VAV box relocation & duct modifications", 12, "EA", 0, 0, 0, 1450),
      it("Diffusers & return grilles", 38, "EA", 0, 0, 0, 165),
      it("Thermostats & controls integration", 8, "EA", 0, 0, 0, 420),
      it("Testing, adjusting & balancing", 1, "LS", 0, 0, 0, 3200),
    ]),
    dv("26", "Electrical", [
      it("Lighting — 2x2 LED troffers", 95, "EA", 0, 0, 0, 285),
      it("Power — receptacles & whips", 140, "EA", 0, 0, 0, 145),
      it("Data / comm rough-in", 120, "EA", 0, 0, 0, 95),
      it("Fire-alarm device modifications", 1, "LS", 0, 0, 0, 4600),
      it("Emergency & exit lighting", 18, "EA", 0, 0, 0, 215),
    ]),
  ];
  const demoPct = [100, 100, 90, 75, 55, 40, 25, 10];
  const pct: Record<string, number> = {};
  divisions.forEach((d, i) => { pct[d.id] = demoPct[i] ?? 0; });
  return {
    meta: { name: "Westgate Tower — Suite 400 Tenant Improvement", client: "Meridian Capital Partners", bidNo: "EST-2026-0418", location: "Golden, CO", sf: 8500, dueLabel: "JUL 09" },
    markups: { ins: 2.5, oh: 8.0, cont: 5.0, profit: 10.0 },
    divisions,
    changeOrders: [
      { id: sid(), no: "CO-001", date: "2026-05-12", desc: "Added dedicated circuits for break-room appliances", status: "approved", amount: 4200 },
      { id: sid(), no: "CO-002", date: "2026-05-28", desc: "Upgrade corridor flooring to porcelain tile per owner", status: "pending", amount: 8650 },
    ],
    billing: { retainage: 5.0, pct },
    payapp: { appNo: "3", periodTo: "2026-06-30", priorPct: 0.62 },
    proposal: proposalDefaults(),
    bidLeveling: bidLevelingDefaults(),
    submittals: [
      { id: newId(), refNo: "SUB-001", title: "Storefront aluminum & glazing shop drawings", court: "Architect", due: "2026-05-20", status: "Under Review" },
      { id: newId(), refNo: "SUB-002", title: "Carpet tile & LVT samples", court: "Owner", due: "2026-05-10", status: "Approved" },
      { id: newId(), refNo: "SUB-003", title: "Light fixture cut sheets — 2x2 LED", court: "GC", due: "2026-05-02", status: "Revise & Resubmit" },
    ],
    rfis: [
      { id: newId(), refNo: "RFI-001", title: "Conflict: VAV box vs. structural beam at gridline C", court: "Engineer", due: "2026-05-08", status: "Open" },
      { id: newId(), refNo: "RFI-002", title: "Confirm finish floor elevation at break room", court: "Architect", due: "2026-05-22", status: "Answered" },
    ],
    dailyReports: [],
  };
}

export const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `c${Math.random().toString(36).slice(2)}`;

// A clean, empty job for starting a brand-new project.
export function blankJob(): Job {
  return {
    meta: { name: "New Project", client: "", bidNo: "", location: "", sf: 0, dueLabel: "" },
    markups: { ins: 2.5, oh: 8.0, cont: 5.0, profit: 10.0 },
    divisions: [],
    changeOrders: [],
    billing: { retainage: 5.0, pct: {} },
    payapp: { appNo: "1", periodTo: "", priorPct: 0 },
    proposal: proposalDefaults(),
    bidLeveling: bidLevelingDefaults(),
    submittals: [],
    rfis: [],
    dailyReports: [],
  };
}
