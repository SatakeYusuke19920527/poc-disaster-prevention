import * as df from "durable-functions";
import { runAgent } from "../services/agentRunner";
import { furusatoPrompt } from "../prompts/furusato";
import { env } from "../shared/env";
import type { AgentInput, AgentOutput } from "../types/chat";

export async function runFurusatoAgent(input: AgentInput): Promise<AgentOutput> {
  return runAgent({
    agent: "furusato",
    deployment: env.openai.deployments.furusato(),
    systemPrompt: furusatoPrompt,
    input,
  });
}

df.app.activity("runFurusatoAgent", { handler: runFurusatoAgent });
