// Server-only: the tools the assistant can call to edit an estimate, plus the
// executor that applies a tool call to an estimate and returns the new estimate.
import type Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { type Estimate, type LineItem, CSI_DIVISIONS } from "./estimate";

export const tools: Anthropic.Tool[] = [
  {
    name: "add_line_item",
    description:
      "Add a new line item to the estimate. Use this whenever the user describes a material, quantity, or scope of work to price out (e.g. '400 sq ft of drywall').",
    input_schema: {
      type: "object",
      properties: {
        division: {
          type: "string",
          description: `The CSI division this item belongs to. Choose the best fit from: ${CSI_DIVISIONS.join("; ")}`,
        },
        description: {
          type: "string",
          description:
            "Short description of the material or work, e.g. '5/8\" drywall — hung, taped, and finished'.",
        },
        quantity: { type: "number", description: "The quantity, as a number." },
        unit: {
          type: "string",
          description:
            "Unit of measure: SF (square feet), LF (linear feet), EA (each), CY (cubic yards), SY (square yards), TON, HR (hours), or LS (lump sum).",
        },
        unit_price: {
          type: "number",
          description:
            "Price per unit in US dollars. If the user did not give a price, use a reasonable current industry estimate and tell them it is an estimate they should confirm.",
        },
      },
      required: ["division", "description", "quantity", "unit", "unit_price"],
      additionalProperties: false,
    },
  },
  {
    name: "update_line_item",
    description:
      "Update one or more fields on an existing line item, identified by its id. Only include the fields you want to change.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The id of the line item to update." },
        division: { type: "string" },
        description: { type: "string" },
        quantity: { type: "number" },
        unit: { type: "string" },
        unit_price: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "remove_line_item",
    description: "Remove a line item from the estimate by its id.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The id of the line item to remove." },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "set_project_name",
    description: "Set or change the project name on the estimate.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
      additionalProperties: false,
    },
  },
];

type ToolInput = Record<string, unknown>;

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const str = (v: unknown, fallback = ""): string =>
  v === undefined || v === null ? fallback : String(v);

// Applies a single tool call to the estimate, returning a NEW estimate object
// plus a short human-readable result string fed back to the model.
export function applyToolUse(
  estimate: Estimate,
  name: string,
  input: ToolInput,
): { estimate: Estimate; result: string } {
  const next: Estimate = {
    projectName: estimate.projectName,
    lineItems: [...estimate.lineItems],
  };

  switch (name) {
    case "add_line_item": {
      const li: LineItem = {
        id: randomUUID(),
        division: str(input.division),
        description: str(input.description),
        quantity: num(input.quantity),
        unit: str(input.unit),
        unitPrice: num(input.unit_price),
      };
      next.lineItems.push(li);
      return {
        estimate: next,
        result: `Added "${li.description}" — ${li.quantity} ${li.unit} @ $${li.unitPrice}/unit (id: ${li.id}).`,
      };
    }
    case "update_line_item": {
      const idx = next.lineItems.findIndex((li) => li.id === input.id);
      if (idx === -1) return { estimate: next, result: `No line item with id ${str(input.id)}.` };
      const cur = { ...next.lineItems[idx] };
      if (input.division !== undefined) cur.division = str(input.division);
      if (input.description !== undefined) cur.description = str(input.description);
      if (input.quantity !== undefined) cur.quantity = num(input.quantity, cur.quantity);
      if (input.unit !== undefined) cur.unit = str(input.unit);
      if (input.unit_price !== undefined) cur.unitPrice = num(input.unit_price, cur.unitPrice);
      next.lineItems[idx] = cur;
      return { estimate: next, result: `Updated line item ${cur.id}.` };
    }
    case "remove_line_item": {
      const before = next.lineItems.length;
      next.lineItems = next.lineItems.filter((li) => li.id !== input.id);
      return {
        estimate: next,
        result:
          before === next.lineItems.length
            ? `No line item with id ${str(input.id)}.`
            : `Removed line item ${str(input.id)}.`,
      };
    }
    case "set_project_name": {
      next.projectName = str(input.name);
      return { estimate: next, result: `Project name set to "${next.projectName}".` };
    }
    default:
      return { estimate: next, result: `Unknown tool: ${name}.` };
  }
}
