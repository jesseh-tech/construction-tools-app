import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { type Job, seedJob, compute, money } from "@/lib/store";
import { tools, applyToolUse } from "@/lib/assistantTools";

// The API key lives only in this server route's environment (ANTHROPIC_API_KEY)
// and never reaches the browser — which is why the assistant needs a backend.
const MODEL = "claude-opus-4-8";
const MAX_TOOL_TURNS = 6;

type ChatMessage = { role: "user" | "assistant"; content: string };

function systemPrompt(job: Job): string {
  const c = compute(job);
  return [
    "You are the in-app assistant for 10 Cent Investments' construction tools, working on one shared job record.",
    "You edit the job through the provided tools — never just describe edits, make them.",
    "The job is organized by CSI MasterFormat divisions. Each line item has a quantity, unit, and PER-UNIT costs split into material/labor/equipment/subcontractor. The bid total builds up from direct cost via insurance, overhead, contingency, and profit percentages; approved change orders adjust the contract value.",
    "When the user mentions a material, quantity, or scope (e.g. '400 sq ft of drywall'), add or update the line item under the right CSI division. If they give one price with no breakdown, place it in the most fitting bucket and note it is an estimate to confirm.",
    "Keep replies short and plain. After editing, confirm what you changed.",
    "Do NOT state the overall Total Bid Price or other compounded totals (basis/contingency/profit/adjusted contract) as specific figures — they recompute live in the app and your mental math will drift. You may state a single line item's direct cost (quantity × unit cost, exact). Refer the user to the live totals in the app.",
    "",
    "Current job (JSON — use the line-item ids when updating/removing):",
    JSON.stringify(job),
    `Direct cost: ${money(c.direct)} · ${c.lineCount} line items · ${job.changeOrders.length} change orders.`,
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
  const system = systemPrompt(working);

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
