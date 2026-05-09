import { getOpenAIClient } from "./openaiClient";
import type {
  AgentInput,
  AgentName,
  AgentOutput,
  Citation,
  Confidence,
} from "../types/chat";
import { AgentError } from "../shared/errors";

interface RunAgentOptions {
  agent: AgentName;
  deployment: string;
  systemPrompt: string;
  input: AgentInput;
}

function buildContextBlock(input: AgentInput): string {
  if (input.documents.length === 0) {
    return "(参照ドキュメントなし)";
  }
  return input.documents
    .map(
      (d, i) =>
        `[${i + 1}] title: ${d.title}\nsource: ${d.source}${d.url ? `\nurl: ${d.url}` : ""}\ncontent: ${d.content}`
    )
    .join("\n\n");
}

function tryParseJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asConfidence(v: unknown): Confidence {
  if (v === "low" || v === "medium" || v === "high") return v;
  return "medium";
}

function asCitations(v: unknown): Citation[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({
      title: typeof x.title === "string" ? x.title : undefined,
      source: typeof x.source === "string" ? x.source : undefined,
      url: typeof x.url === "string" ? x.url : undefined,
    }));
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export async function runAgent(opts: RunAgentOptions): Promise<AgentOutput> {
  const client = getOpenAIClient();

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: opts.systemPrompt },
  ];
  for (const turn of opts.input.history.slice(-10)) {
    if (turn.role === "user" || turn.role === "assistant") {
      messages.push({ role: turn.role, content: turn.content });
    }
  }
  messages.push({
    role: "user",
    content: `# 参照コンテキスト\n${buildContextBlock(opts.input)}\n\n# 質問\n${opts.input.message}\n\n必ず指定された JSON 形式のみで回答してください。`,
  });

  let response;
  try {
    response = await client.chat.completions.create({
      model: opts.deployment,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
  } catch (e) {
    throw new AgentError(`OpenAI call failed for ${opts.agent}`, e);
  }

  const choice = response.choices[0];
  const text = choice?.message?.content ?? "";
  const parsed = tryParseJson(text);

  const answer =
    parsed && typeof parsed.answer === "string" && parsed.answer.length > 0
      ? parsed.answer
      : text || "回答を取得できませんでした。";

  return {
    agent: opts.agent,
    answer,
    citations: parsed ? asCitations(parsed.citations) : [],
    confidence: parsed ? asConfidence(parsed.confidence) : "low",
    safetyNotes: parsed ? asStringArray(parsed.safetyNotes) : [],
    tokenUsage: {
      input: response.usage?.prompt_tokens ?? 0,
      output: response.usage?.completion_tokens ?? 0,
    },
  };
}
