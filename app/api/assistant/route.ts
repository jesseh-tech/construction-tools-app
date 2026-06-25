import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { type Estimate, emptyEstimate, estimateTotals, money } from "@/lib/estimate";
import { tools, applyToolUse } from "@/lib/assistantTools";

// The API key never reaches the browser — it lives only in this server route's
// environment (ANTHROPIC_API_KEY). This is why the assistant needs a backend.
const MODEL = "claude-opus-4-8";
const MAX_TOOL_TURNS = 6;

type ChatMessage = { role: "user" | "assistant"; content: string };

function systemPrompt(estimate: Estimate): string {
  const t = estimateTotals(estimate);
  return [
    "You are the in-app estimating assistant for 10 Cent Investments' construction tools.",
    "You help build a construction cost estimate by editing it through the provided tools — never just describe edits, make them.",
    "The estimate is organized by CSI MasterFormat divisions. Each line item has a quantity, unit, and PER-UNIT costs split into material, labor, equipment, and subcontractor buckets. The bid total is built up from direct cost via insurance, overhead, contingency, and profit percentages.",
    "When the user mentions a material, quantity, or scope (e.g. '400 sq ft of drywall'), add or update the line item under the right CSI division. If they give one price with no breakdown, place it in the most fitting bucket (material for supplied goods, sub for subcontracted scopes, labor for install) and note it is an estimate to confirm.",
    "Keep replies short and plain. After editing, confirm what you changed in plain terms.",
    "Do NOT state the overall Total Bid Price (or basis/contingency/profit dollar amounts) as a specific figure — those recompute live in the app from compounding percentages and your mental math will drift. You may state a single line item's direct cost (quantity × unit cost, which is exact). For the bid total, refer the user to the live Total Bid Price shown in the panel.",
    "",
    "Current estimate (JSON — use the line-item ids when updating/removing):",
    JSON.stringify(estimate),
    `Direct cost: ${money(t.direct)} · Total Bid Price: ${money(t.total)} · ${t.lineCount} line items.`,
  ].join("\n");
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet — ANTHROPIC_API_KEY is missing on the server." },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[]; estimate?: Estimate };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const client = new Anthropic();
  const history = Array.isArray(body.messages) ? body.messages : [];
  let working: Estimate = body.estimate ?? emptyEstimate();

  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Hold the system prompt at the estimate's starting state for the whole loop.
  // The tool results report what changed — re-injecting the mutating estimate
  // each turn makes the model double-count its own edits.
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

      // Collect any text the model produced this turn.
      reply = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();

      if (response.stop_reason !== "tool_use") break;

      // Execute every tool call against the working estimate, then feed results back.
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const { estimate: updated, result } = applyToolUse(
          working,
          block.name,
          block.input as Record<string, unknown>,
        );
        working = updated;
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    return NextResponse.json({ reply, estimate: working });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json(
      { error: `The assistant ran into a problem: ${message}` },
      { status: 502 },
    );
  }
}
