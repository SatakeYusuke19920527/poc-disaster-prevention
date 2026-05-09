import * as df from "durable-functions";
import { InvocationContext } from "@azure/functions";
import { getOpenAIClient } from "../services/openaiClient";
import { intentClassifierPrompt } from "../prompts/intentClassifier";
import { env } from "../shared/env";
import { AgentError } from "../shared/errors";
import type { AgentName, ConversationTurn, IntentResult } from "../types/chat";

interface Input {
  message: string;
  history: ConversationTurn[];
}

const VALID_AGENTS: AgentName[] = [
  "furusato",
  "disaster-simulation",
  "disaster-learning",
];

function fallbackIntent(): IntentResult {
  return {
    intent: "general",
    agent: "disaster-learning",
    needsRetrieval: false,
    confidence: "low",
  };
}

export async function classifyIntent(
  input: Input,
  context: InvocationContext
): Promise<IntentResult> {
  const client = getOpenAIClient();
  const deployment = env.openai.deployments.intent();

  let response;
  try {
    response = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: "system", content: intentClassifierPrompt },
        { role: "user", content: input.message },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });
  } catch (e) {
    context.error("classifyIntent OpenAI failure", e);
    throw new AgentError("Intent classification failed", e);
  }

  const text = response.choices[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const agent = VALID_AGENTS.includes(parsed.agent as AgentName)
      ? (parsed.agent as AgentName)
      : "disaster-learning";
    return {
      intent: typeof parsed.intent === "string" ? parsed.intent : "general",
      agent,
      needsRetrieval: parsed.needsRetrieval === true,
      confidence:
        parsed.confidence === "low" ||
        parsed.confidence === "medium" ||
        parsed.confidence === "high"
          ? parsed.confidence
          : "low",
    };
  } catch {
    context.warn("classifyIntent could not parse JSON; using fallback.");
    return fallbackIntent();
  }
}

df.app.activity("classifyIntent", { handler: classifyIntent });
