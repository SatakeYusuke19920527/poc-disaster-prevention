import * as df from "durable-functions";
import { runAgent } from "../services/agentRunner";
import { disasterLearningPrompt } from "../prompts/disasterLearning";
import { env } from "../shared/env";
import type { AgentInput, AgentOutput } from "../types/chat";

export async function runDisasterLearningAgent(
  input: AgentInput
): Promise<AgentOutput> {
  return runAgent({
    agent: "disaster-learning",
    deployment: env.openai.deployments.disasterLearning(),
    systemPrompt: disasterLearningPrompt,
    input,
  });
}

df.app.activity("runDisasterLearningAgent", {
  handler: runDisasterLearningAgent,
});
