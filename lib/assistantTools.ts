// Server-only: the tools the assistant can call to edit the shared job, plus the
// executor that applies a tool call and returns the new job.
import type Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { type Job, type Division, type LineItem, UNITS, CSI_CATALOG, csiName } from "./store";

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
    default:
      return { job: j, result: `Unknown tool: ${name}.` };
  }
}

type ChangeOrderStatus = "pending" | "approved" | "rejected";
