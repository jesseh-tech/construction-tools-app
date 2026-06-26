import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { type Job, seedJob, compute, sov, money } from "@/lib/store";
import { tools, applyToolUse } from "@/lib/assistantTools";

const CLOSED_STATUS = ["Approved", "Answered", "Closed", "Approved as Noted"];
const overdue = (items: { status: string; due: string }[], today: string) =>
  items.filter((i) => !CLOSED_STATUS.includes(i.status) && i.due && i.due < today).length;

// The API key lives only in this server route's environment (ANTHROPIC_API_KEY)
// and never reaches the browser — which is why the assistant needs a backend.
const MODEL = "claude-opus-4-8";
const MAX_TOOL_TURNS = 6;

type ChatMessage = { role: "user" | "assistant"; content: string };

function systemPrompt(job: Job, today: string): string {
  const c = compute(job);
  const s = sov(job, c);
  const snapshot = [
    `- Today's date: ${today}`,
    `- Project: ${job.meta.name || "(unnamed)"} for ${job.meta.client || "(no client)"} — ${job.meta.location}, BID ${job.meta.bidNo}, ${job.meta.sf.toLocaleString("en-US")} SF, bid due ${job.meta.dueLabel}`,
    `- Total Bid Price: ${money(c.total)} · Adjusted contract (with approved COs): ${money(c.adjustedContract)} · Direct cost: ${money(c.direct)}`,
    `- Margin: ${c.margin.toFixed(1)}% · Cost/SF: $${c.perSF.toFixed(2)} · ${c.lineCount} line items across ${c.divCount} divisions`,
    `- Cost mix: material ${money(c.mat)}, labor ${money(c.lab)}, equipment ${money(c.eq)}, subs ${money(c.sub)}`,
    `- Change orders: ${job.changeOrders.length} (approved ${money(c.coApproved)}, pending ${money(c.coPending)})`,
    `- Billing: ${s.pctBilled.toFixed(1)}% billed (${money(s.completedTotal)} of ${money(s.schedTotal)}), retainage ${job.billing.retainage}%`,
    `- Submittals: ${job.submittals.length} (${overdue(job.submittals, today)} overdue) · RFIs: ${job.rfis.length} (${overdue(job.rfis, today)} overdue)`,
    `- Punch list: ${job.punchList.filter((p) => p.status !== "Closed").length} open of ${job.punchList.length}`,
  ].join("\n");

  return [
    "You are the AI assistant built into 10 Cent Investments' construction tools — a sharp, proactive, construction-savvy project assistant for a commercial general contractor. You both ANSWER questions about the job and MAKE edits across all nine tools, all sharing one job record.",
    "",
    "You can edit: the Estimate (line items by CSI division, each with quantity/unit and per-unit material/labor/equipment/sub costs; markups for insurance, overhead, contingency, profit; project info), Change Orders, Schedule of Values % complete and retainage, the Pay Application (via SOV), Submittals & RFIs, Daily Field Reports, the Bid Proposal text, Bid Leveling, the Punch List (add items; update status/assignee/trade/priority/due by item number, e.g. PL-002), and the Project Directory (add companies/contacts), Commitments (add subcontracts/POs), and Inspections (create quality/safety checklists).",
    "Always make changes through the tools — never just describe an edit, perform it. When a material/quantity/scope is mentioned (e.g. '400 sq ft of drywall'), add or update the line item under the right CSI division; if given one price with no breakdown, place it in the best-fitting bucket and note it's an estimate to confirm.",
    "Be genuinely helpful: answer questions directly using the snapshot and JSON below (totals, margins, what's overdue, comparisons), flag risks (overdue RFIs, thin margin, missing prices), and suggest sensible next steps — but don't take big or destructive actions without being asked.",
    "Keep replies short, plain, and professional. After editing, confirm crisply what changed.",
    "You MAY quote the figures in the snapshot below — they are authoritative as of now. But do NOT re-derive compounded totals (Total Bid Price, cost basis, contingency, profit, adjusted contract, payment due) in your head AFTER making an edit — those recompute live in the app; tell the user the app updated them.",
    "",
    "=== Current job snapshot ===",
    snapshot,
    "",
    "=== Full job JSON (use line-item ids and submittal/RFI reference numbers when editing) ===",
    JSON.stringify(job),
  ].join("\n");
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet — ANTHROPIC_API_KEY is missing on the server." },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[]; job?: Job };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const client = new Anthropic();
  const history = Array.isArray(body.messages) ? body.messages : [];
  let working: Job = body.job ?? seedJob();

  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));
  const system = systemPrompt(working, new Date().toISOString().slice(0, 10));

  try {
    let reply = "";
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system,
        tools,
        messages,
      });
      messages.push({ role: "assistant", content: response.content });

      reply = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();

      if (response.stop_reason !== "tool_use") break;

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const { job: updated, result } = applyToolUse(working, block.name, block.input as Record<string, unknown>);
        working = updated;
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
      messages.push({ role: "user", content: toolResults });
    }

    return NextResponse.json({ reply, job: working });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json({ error: `The assistant ran into a problem: ${message}` }, { status: 502 });
  }
}
