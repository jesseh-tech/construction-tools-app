import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { type Estimate, emptyEstimate, estimateSubtotal, formatUSD } from "@/lib/estimate";
import { tools, applyToolUse } from "@/lib/assistantTools";

// The API key never reaches the browser — it lives only in this server route's
// environment (ANTHROPIC_API_KEY). This is why the assistant needs a backend.
const MODEL = "claude-opus-4-8";
const MAX_TOOL_TURNS = 6;

type ChatMessage = { role: "user" | "assistant"; content: string };

function systemPrompt(estimate: Estimate): string {
  return [
    "You are the in-app estimating assistant for 10 Cent Investments' construction tools.",
    "You help the user build a construction cost estimate by editing it through the provided tools.",
    "When the user mentions a material, quantity, or scope (e.g. '400 sq ft of drywall'), add or update the corresponding line item using the tools — do not just describe what to do.",
    "Organize items by CSI division. If the user gives no price, use a reasonable current industry unit price and clearly note it is an estimate to confirm.",
    "Keep replies short and plain. After editing, briefly state what you changed and the new subtotal.",
    "",
    "Current estimate (JSON — use the ids when updating or removing items):",
    JSON.stringify(estimate),
    `Current subtotal: ${formatUSD(estimateSubtotal(estimate))}`,
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
