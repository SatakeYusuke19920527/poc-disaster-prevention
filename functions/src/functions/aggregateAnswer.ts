import * as df from "durable-functions";
import type { AgentOutput, TokenUsage } from "../types/chat";

interface Input {
  outputs: AgentOutput[];
}

function sumTokens(outputs: AgentOutput[]): TokenUsage {
  return outputs.reduce<TokenUsage>(
    (acc, o) => ({
      input: acc.input + (o.tokenUsage?.input ?? 0),
      output: acc.output + (o.tokenUsage?.output ?? 0),
    }),
    { input: 0, output: 0 }
  );
}

export async function aggregateAnswer(input: Input): Promise<AgentOutput> {
  const outputs = input.outputs ?? [];
  if (outputs.length === 0) {
    return {
      agent: "multi-agent",
      answer: "回答を生成できませんでした。",
      citations: [],
      confidence: "low",
      safetyNotes: [],
      tokenUsage: { input: 0, output: 0 },
    };
  }
  if (outputs.length === 1) return outputs[0];

  const sections = outputs
    .map((o) => `## ${o.agent}\n${o.answer}`)
    .join("\n\n");
  const citations = outputs.flatMap((o) => o.citations);
  const safetyNotes = Array.from(
    new Set(outputs.flatMap((o) => o.safetyNotes))
  );

  return {
    agent: "multi-agent",
    answer: sections,
    citations,
    confidence: "medium",
    safetyNotes,
    tokenUsage: sumTokens(outputs),
  };
}

df.app.activity("aggregateAnswer", { handler: aggregateAnswer });
