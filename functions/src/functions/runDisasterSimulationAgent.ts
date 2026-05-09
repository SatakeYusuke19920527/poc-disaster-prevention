import * as df from "durable-functions";
import { runAgent } from "../services/agentRunner";
import { disasterSimulationPrompt } from "../prompts/disasterSimulation";
import { env } from "../shared/env";
import type { AgentInput, AgentOutput } from "../types/chat";

export async function runDisasterSimulationAgent(
  input: AgentInput
): Promise<AgentOutput> {
  return runAgent({
    agent: "disaster-simulation",
    deployment: env.openai.deployments.disasterSimulation(),
    systemPrompt: disasterSimulationPrompt,
    input,
  });
}

df.app.activity("runDisasterSimulationAgent", {
  handler: runDisasterSimulationAgent,
});
