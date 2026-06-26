// Server-only: the tools the assistant can call to edit the shared job, plus the
// executor that applies a tool call and returns the new job.
import type Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { type Job, type Division, type LineItem, type TrackItem, type DailyReport, type Crew, type Proposal, UNITS, CSI_CATALOG, csiName, bidLevelingDefaults } from "./store";

const unitList = UNITS.join(", ");
const csiList = CSI_CATALOG.map(([c, name]) => `${c} ${name}`).join("; ");

export const tools: Anthropic.Tool[] = [
  {
    name: "add_line_item",
    description:
      "Add a line item to the estimate (e.g. '400 sq ft of drywall'). Costs are PER UNIT, split across material/labor/equipment/sub. Put the cost in whichever bucket fits; if the user gives one price and no breakdown, use material for supplied goods, sub for subcontracted scopes, labor for install — and note it's an estimate to confirm. If the division code isn't present yet it is created automatically.",
    input_schema: {
      type: "object",
      properties: {
        division_code: { type: "string", description: `Two-digit CSI division code. Choose from: ${csiList}` },
        description: { type: "string" },
        quantity: { type: "number" },
        unit: { type: "string", description: `Unit of measure: ${unitList}` },
        material_cost: { type: "number", description: "Material $/unit." },
        labor_cost: { type: "number", description: "Labor $/unit." },
        equipment_cost: { type: "number", description: "Equipment $/unit." },
        sub_cost: { type: "number", description: "Subcontractor $/unit." },
      },
      required: ["division_code", "description", "quantity", "unit"],
      additionalProperties: false,
    },
  },
  {
    name: "update_line_item",
    description: "Update fields on an existing line item by its id. Include only fields to change.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        description: { type: "string" },
        quantity: { type: "number" },
        unit: { type: "string" },
        material_cost: { type: "number" },
        labor_cost: { type: "number" },
        equipment_cost: { type: "number" },
        sub_cost: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "remove_line_item",
    description: "Remove a line item by its id.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"], additionalProperties: false },
  },
  {
    name: "add_division",
    description: "Add a CSI division if not already present.",
    input_schema: {
      type: "object",
      properties: { code: { type: "string" }, name: { type: "string" } },
      required: ["code"],
    },
  },
  {
    name: "remove_division",
    description: "Remove a division (and its line items) by code.",
    input_schema: { type: "object", properties: { code: { type: "string" } }, required: ["code"], additionalProperties: false },
  },
  {
    name: "set_meta_field",
    description: "Set a project header field.",
    input_schema: {
      type: "object",
      properties: {
        field: { type: "string", enum: ["name", "client", "bidNo", "location", "sf", "dueLabel"] },
        value: { type: "string", description: "New value. For 'sf' pass the number as a string." },
      },
      required: ["field", "value"],
      additionalProperties: false,
    },
  },
  {
    name: "set_markup",
    description: "Set a bid build-up markup percentage (insurance, overhead, contingency, profit).",
    input_schema: {
      type: "object",
      properties: { field: { type: "string", enum: ["ins", "oh", "cont", "profit"] }, percent: { type: "number" } },
      required: ["field", "percent"],
      additionalProperties: false,
    },
  },
  {
    name: "add_change_order",
    description: "Log a change order. Status defaults to pending. Approved COs adjust the contract value.",
    input_schema: {
      type: "object",
      properties: {
        description: { type: "string" },
        amount: { type: "number" },
        status: { type: "string", enum: ["pending", "approved", "rejected"] },
        date: { type: "string", description: "ISO date YYYY-MM-DD; optional." },
      },
      required: ["description", "amount"],
    },
  },
  {
    name: "set_division_pct",
    description: "Set a division's percent-complete for billing (drives the Schedule of Values and Pay Application). 0–100.",
    input_schema: {
      type: "object",
      properties: { division_code: { type: "string", description: "Two-digit CSI code." }, percent: { type: "number" } },
      required: ["division_code", "percent"],
      additionalProperties: false,
    },
  },
  {
    name: "set_retainage",
    description: "Set the retainage percentage withheld on each draw (Schedule of Values + Pay Application).",
    input_schema: {
      type: "object",
      properties: { percent: { type: "number" } },
      required: ["percent"],
      additionalProperties: false,
    },
  },
  {
    name: "add_tracking_item",
    description: "Log a new submittal or RFI. A reference number is assigned automatically.",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["submittal", "rfi"] },
        title: { type: "string", description: "Submittal description or RFI question." },
        court: { type: "string", enum: ["GC", "Architect", "Owner", "Engineer", "Sub"], description: "Ball in court; defaults to GC." },
        due: { type: "string", description: "Due date YYYY-MM-DD; optional." },
        status: { type: "string", description: "Optional status; defaults to Draft (submittal) or Open (RFI)." },
      },
      required: ["kind", "title"],
    },
  },
  {
    name: "update_tracking_item",
    description: "Update a submittal or RFI by its reference number (e.g. SUB-002, RFI-001) — change status, ball-in-court, due date, or title.",
    input_schema: {
      type: "object",
      properties: {
        ref_no: { type: "string" },
        status: { type: "string" },
        court: { type: "string", enum: ["GC", "Architect", "Owner", "Engineer", "Sub"] },
        due: { type: "string" },
        title: { type: "string" },
      },
      required: ["ref_no"],
    },
  },
  {
    name: "remove_tracking_item",
    description: "Remove a submittal or RFI by its reference number.",
    input_schema: {
      type: "object",
      properties: { ref_no: { type: "string" } },
      required: ["ref_no"],
      additionalProperties: false,
    },
  },
  {
    name: "save_daily_report",
    description: "Create and save a daily field report. Use when the user describes a day in the field (weather, crews on site, work performed, issues).",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "YYYY-MM-DD; defaults to today." },
        weather: { type: "string", description: "e.g. Clear, Rain, Overcast, Windy, Hot, Freezing." },
        temp: { type: "string", description: "Temperature °F." },
        delays: { type: "string", description: "Delays / lost time, if any." },
        work: { type: "string", description: "Work performed today." },
        notes: { type: "string", description: "Notes, issues, deliveries, inspections." },
        crews: {
          type: "array",
          description: "Crews on site.",
          items: {
            type: "object",
            properties: { company: { type: "string" }, count: { type: "string", description: "Headcount." }, hours: { type: "string", description: "Hours worked." } },
            required: ["company"],
          },
        },
      },
      required: ["work"],
    },
  },
  {
    name: "set_proposal_field",
    description: "Edit a field on the client-facing Bid Proposal (intro paragraph, inclusions, exclusions, prepared-by, valid days, or date).",
    input_schema: {
      type: "object",
      properties: {
        field: { type: "string", enum: ["intro", "inclusions", "exclusions", "preparedBy", "validDays", "date"] },
        value: { type: "string" },
      },
      required: ["field", "value"],
      additionalProperties: false,
    },
  },
  {
    name: "add_bidder",
    description: "Add a subcontractor bidder column to the Bid Leveling comparison.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "set_bid_price",
    description: "Set a bidder's price for a scope line in Bid Leveling. Matches the bidder and scope line by name (partial, case-insensitive).",
    input_schema: {
      type: "object",
      properties: {
        bidder: { type: "string", description: "Bidder name (or part of it)." },
        scope: { type: "string", description: "Scope line label (or part of it)." },
        amount: { type: "number" },
      },
      required: ["bidder", "scope", "amount"],
      additionalProperties: false,
    },
  },
];

type ToolInput = Record<string, unknown>;
const num = (v: unknown, f = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : f;
};
const str = (v: unknown, f = ""): string => (v === undefined || v === null ? f : String(v));

function clone(job: Job): Job {
  return {
    meta: { ...job.meta },
    markups: { ...job.markups },
    divisions: job.divisions.map((d) => ({ ...d, items: d.items.map((i) => ({ ...i })) })),
    changeOrders: job.changeOrders.map((c) => ({ ...c })),
    billing: { retainage: job.billing.retainage, pct: { ...job.billing.pct } },
    payapp: { ...job.payapp },
    proposal: { ...job.proposal },
    bidLeveling: job.bidLeveling,
    rfis: [...job.rfis],
    submittals: [...job.submittals],
    dailyReports: [...job.dailyReports],
  };
}

function ensureDivision(job: Job, code: string, name?: string): Division {
  const found = job.divisions.find((x) => x.code === code);
  if (found) return found;
  const d: Division = { id: randomUUID(), code, name: name || csiName(code), collapsed: false, items: [] };
  job.divisions.push(d);
  job.divisions.sort((a, b) => (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0));
  return d;
}

function findItem(job: Job, id: string): { div: Division; item: LineItem } | null {
  for (const div of job.divisions) {
    const item = div.items.find((i) => i.id === id);
    if (item) return { div, item };
  }
  return null;
}

export function applyToolUse(job: Job, name: string, input: ToolInput): { job: Job; result: string } {
  const j = clone(job);
  switch (name) {
    case "add_line_item": {
      const div = ensureDivision(j, str(input.division_code));
      const li: LineItem = {
        id: randomUUID(),
        desc: str(input.description),
        qty: num(input.quantity),
        unit: str(input.unit, "EA"),
        m: num(input.material_cost),
        l: num(input.labor_cost),
        e: num(input.equipment_cost),
        s: num(input.sub_cost),
      };
      div.items.push(li);
      return { job: j, result: `Added "${li.desc}" (${li.qty} ${li.unit}) to Div ${div.code} ${div.name}. id: ${li.id}` };
    }
    case "update_line_item": {
      const found = findItem(j, str(input.id));
      if (!found) return { job: j, result: `No line item with id ${str(input.id)}.` };
      const { item } = found;
      if (input.description !== undefined) item.desc = str(input.description);
      if (input.quantity !== undefined) item.qty = num(input.quantity, item.qty);
      if (input.unit !== undefined) item.unit = str(input.unit, item.unit);
      if (input.material_cost !== undefined) item.m = num(input.material_cost, item.m);
      if (input.labor_cost !== undefined) item.l = num(input.labor_cost, item.l);
      if (input.equipment_cost !== undefined) item.e = num(input.equipment_cost, item.e);
      if (input.sub_cost !== undefined) item.s = num(input.sub_cost, item.s);
      return { job: j, result: `Updated line item ${item.id}.` };
    }
    case "remove_line_item": {
      const found = findItem(j, str(input.id));
      if (!found) return { job: j, result: `No line item with id ${str(input.id)}.` };
      found.div.items = found.div.items.filter((i) => i.id !== input.id);
      return { job: j, result: `Removed line item ${str(input.id)}.` };
    }
    case "add_division": {
      const before = j.divisions.length;
      const d = ensureDivision(j, str(input.code), input.name ? str(input.name) : undefined);
      return { job: j, result: j.divisions.length === before ? `Division ${d.code} already present.` : `Added Div ${d.code} ${d.name}.` };
    }
    case "remove_division": {
      const code = str(input.code);
      const before = j.divisions.length;
      j.divisions = j.divisions.filter((d) => d.code !== code);
      return { job: j, result: before === j.divisions.length ? `No division ${code}.` : `Removed Div ${code}.` };
    }
    case "set_meta_field": {
      const field = str(input.field);
      if (field === "sf") j.meta.sf = num(input.value);
      else if (["name", "client", "bidNo", "location", "dueLabel"].includes(field))
        (j.meta as unknown as Record<string, string>)[field] = str(input.value);
      else return { job: j, result: `Unknown field ${field}.` };
      return { job: j, result: `Set ${field}.` };
    }
    case "set_markup": {
      const field = str(input.field) as keyof Job["markups"];
      if (!["ins", "oh", "cont", "profit"].includes(field)) return { job: j, result: `Unknown markup ${field}.` };
      j.markups[field] = num(input.percent, j.markups[field]);
      return { job: j, result: `Set ${field} markup to ${j.markups[field]}%.` };
    }
    case "add_change_order": {
      const n = j.changeOrders.length + 1;
      j.changeOrders.push({
        id: randomUUID(),
        no: `CO-${String(n).padStart(3, "0")}`,
        date: str(input.date) || new Date().toISOString().slice(0, 10),
        desc: str(input.description),
        status: (["pending", "approved", "rejected"].includes(str(input.status)) ? str(input.status) : "pending") as ChangeOrderStatus,
        amount: num(input.amount),
      });
      return { job: j, result: `Logged change order for ${str(input.description)}.` };
    }
    case "set_division_pct": {
      const code = str(input.division_code);
      const div = j.divisions.find((d) => d.code === code);
      if (!div) return { job: j, result: `No division with code ${code}.` };
      const pct = Math.max(0, Math.min(100, num(input.percent)));
      j.billing.pct = { ...j.billing.pct, [div.id]: pct };
      return { job: j, result: `Set Div ${code} ${div.name} to ${pct}% complete.` };
    }
    case "set_retainage": {
      j.billing.retainage = num(input.percent, j.billing.retainage);
      return { job: j, result: `Set retainage to ${j.billing.retainage}%.` };
    }
    case "add_tracking_item": {
      const isSub = str(input.kind) === "submittal";
      const list = isSub ? j.submittals : j.rfis;
      const prefix = isSub ? "SUB-" : "RFI-";
      const item: TrackItem = {
        id: randomUUID(),
        refNo: `${prefix}${String(list.length + 1).padStart(3, "0")}`,
        title: str(input.title),
        court: str(input.court, "GC"),
        due: str(input.due),
        status: str(input.status) || (isSub ? "Draft" : "Open"),
      };
      if (isSub) j.submittals = [...j.submittals, item];
      else j.rfis = [...j.rfis, item];
      return { job: j, result: `Logged ${item.refNo}: ${item.title}` };
    }
    case "update_tracking_item": {
      const ref = str(input.ref_no);
      const patch: Partial<TrackItem> = {};
      if (input.status !== undefined) patch.status = str(input.status);
      if (input.court !== undefined) patch.court = str(input.court);
      if (input.due !== undefined) patch.due = str(input.due);
      if (input.title !== undefined) patch.title = str(input.title);
      const apply = (arr: TrackItem[]) => arr.map((x) => (x.refNo === ref ? { ...x, ...patch } : x));
      if (j.submittals.some((x) => x.refNo === ref)) j.submittals = apply(j.submittals);
      else if (j.rfis.some((x) => x.refNo === ref)) j.rfis = apply(j.rfis);
      else return { job: j, result: `No submittal or RFI ${ref}.` };
      return { job: j, result: `Updated ${ref}.` };
    }
    case "remove_tracking_item": {
      const ref = str(input.ref_no);
      const before = j.submittals.length + j.rfis.length;
      j.submittals = j.submittals.filter((x) => x.refNo !== ref);
      j.rfis = j.rfis.filter((x) => x.refNo !== ref);
      return { job: j, result: before === j.submittals.length + j.rfis.length ? `No item ${ref}.` : `Removed ${ref}.` };
    }
    case "save_daily_report": {
      const crewsIn = Array.isArray(input.crews) ? (input.crews as Record<string, unknown>[]) : [];
      const crews: Crew[] = crewsIn.map((cw) => ({ id: randomUUID(), company: str(cw.company), count: str(cw.count, "0"), hours: str(cw.hours, "8") }));
      const rep: DailyReport = {
        id: randomUUID(),
        date: str(input.date) || new Date().toISOString().slice(0, 10),
        weather: str(input.weather, "Clear"),
        temp: str(input.temp, "72"),
        delays: str(input.delays),
        crews,
        work: str(input.work),
        notes: str(input.notes),
      };
      j.dailyReports = [rep, ...j.dailyReports].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      return { job: j, result: `Saved daily report for ${rep.date} (${crews.length} crew${crews.length === 1 ? "" : "s"}).` };
    }
    case "set_proposal_field": {
      const field = str(input.field);
      if (!["intro", "inclusions", "exclusions", "preparedBy", "validDays", "date"].includes(field))
        return { job: j, result: `Unknown proposal field ${field}.` };
      j.proposal = { ...j.proposal, [field as keyof Proposal]: str(input.value) };
      return { job: j, result: `Updated proposal ${field}.` };
    }
    case "add_bidder": {
      if (!j.bidLeveling) j.bidLeveling = bidLevelingDefaults();
      j.bidLeveling = { ...j.bidLeveling, subs: [...j.bidLeveling.subs, { id: randomUUID(), name: str(input.name), prices: {} }] };
      return { job: j, result: `Added bidder "${str(input.name)}".` };
    }
    case "set_bid_price": {
      if (!j.bidLeveling) j.bidLeveling = bidLevelingDefaults();
      const bl = j.bidLeveling;
      const bq = str(input.bidder).toLowerCase();
      const sq = str(input.scope).toLowerCase();
      const sub = bl.subs.find((s) => s.name.toLowerCase().includes(bq));
      const sc = bl.scope.find((s) => s.label.toLowerCase().includes(sq));
      if (!sub) return { job: j, result: `No bidder matching "${str(input.bidder)}".` };
      if (!sc) return { job: j, result: `No scope line matching "${str(input.scope)}".` };
      j.bidLeveling = { ...bl, subs: bl.subs.map((s) => (s.id !== sub.id ? s : { ...s, prices: { ...s.prices, [sc.id]: String(num(input.amount)) } })) };
      return { job: j, result: `Set ${sub.name} · ${sc.label} to $${num(input.amount)}.` };
    }
    default:
      return { job: j, result: `Unknown tool: ${name}.` };
  }
}

type ChangeOrderStatus = "pending" | "approved" | "rejected";
