// Shared estimate model — mirrors the Claude Design "Estimate Worksheet" prototype.
// Used by both the UI (client) and the assistant backend (server). No server-only imports.

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
  code: string; // CSI code, e.g. "09"
  name: string;
  collapsed: boolean;
  items: LineItem[];
};

export type Project = {
  name: string;
  client: string;
  bidNo: string;
  location: string;
  sf: number; // building area
  dueLabel: string;
};

export type Markups = {
  ins: number; // insurance & bonding %
  oh: number; // overhead & G&A %
  cont: number; // contingency %
  profit: number; // profit / fee %
};

export type Estimate = {
  project: Project;
  markups: Markups;
  divisions: Division[];
};

export const UNITS = ["EA", "SF", "LF", "SY", "CY", "LS", "HR", "TON", "LB", "GAL"] as const;

// Full CSI MasterFormat catalog (code, name) from the prototype.
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

export const lineTotal = (li: LineItem): number =>
  li.qty * (li.m + li.l + li.e + li.s);

export type DivisionTotals = { m: number; l: number; e: number; s: number; subtotal: number };

export function divisionTotals(d: Division): DivisionTotals {
  let m = 0, l = 0, e = 0, s = 0;
  for (const it of d.items) {
    m += it.qty * it.m;
    l += it.qty * it.l;
    e += it.qty * it.e;
    s += it.qty * it.s;
  }
  return { m, l, e, s, subtotal: m + l + e + s };
}

export type EstimateTotals = {
  mat: number; lab: number; eq: number; sub: number;
  direct: number; ins: number; oh: number; basis: number;
  cont: number; profit: number; total: number;
  margin: number; costPerSF: number; lineCount: number;
  matPct: number; labPct: number; eqPct: number; subPct: number;
};

export function estimateTotals(est: Estimate): EstimateTotals {
  let mat = 0, lab = 0, eq = 0, sub = 0, lineCount = 0;
  for (const d of est.divisions) {
    const t = divisionTotals(d);
    mat += t.m; lab += t.l; eq += t.e; sub += t.s;
    lineCount += d.items.length;
  }
  const direct = mat + lab + eq + sub;
  const ins = (direct * est.markups.ins) / 100;
  const oh = (direct * est.markups.oh) / 100;
  const basis = direct + ins + oh;
  const cont = (basis * est.markups.cont) / 100;
  const pre = basis + cont;
  const profit = (pre * est.markups.profit) / 100;
  const total = pre + profit;
  const margin = total > 0 ? (profit / total) * 100 : 0;
  const sf = est.project.sf || 1;
  const pct = (x: number) => (direct > 0 ? (x / direct) * 100 : 0);
  return {
    mat, lab, eq, sub, direct, ins, oh, basis, cont, profit, total,
    margin, costPerSF: total / sf, lineCount,
    matPct: pct(mat), labPct: pct(lab), eqPct: pct(eq), subPct: pct(sub),
  };
}

export function money(n: number, showCents = false): string {
  const neg = n < 0;
  const a = Math.abs(n);
  const str = showCents
    ? a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(a).toLocaleString("en-US");
  return (neg ? "-$" : "$") + str;
}

const id = (() => {
  let n = 0;
  return () => `seed-${n++}`;
})();

const it = (desc: string, qty: number, unit: string, m: number, l: number, e: number, s: number): LineItem =>
  ({ id: id(), desc, qty, unit, m, l, e, s });
const dv = (code: string, name: string, items: LineItem[]): Division =>
  ({ id: id(), code, name, collapsed: false, items });

// Seed estimate (the prototype's Westgate Tower demo) so the tool opens looking complete.
export function defaultEstimate(): Estimate {
  return {
    project: {
      name: "Westgate Tower — Suite 400 Tenant Improvement",
      client: "Meridian Capital Partners",
      bidNo: "EST-2026-0418",
      location: "Golden, CO",
      sf: 8500,
      dueLabel: "JUL 09",
    },
    markups: { ins: 2.5, oh: 8.0, cont: 5.0, profit: 10.0 },
    divisions: [
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
    ],
  };
}

export const emptyEstimate = (): Estimate => ({
  project: { name: "Untitled Project", client: "", bidNo: "", location: "", sf: 0, dueLabel: "" },
  markups: { ins: 2.5, oh: 8.0, cont: 5.0, profit: 10.0 },
  divisions: [],
});
