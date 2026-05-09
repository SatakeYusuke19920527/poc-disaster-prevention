import * as df from "durable-functions";
import { InvocationContext } from "@azure/functions";
import { getTelemetryClient } from "../services/appInsights";
import type { AgentName, TokenUsage } from "../types/chat";

interface Input {
  sessionId: string;
  userId: string;
  intent: string;
  agent: AgentName;
  latencyMs: number;
  tokenUsage: TokenUsage;
  instanceId: string;
}

export async function trackTelemetry(
  input: Input,
  context: InvocationContext
): Promise<{ tracked: boolean }> {
  const client = getTelemetryClient();
  if (!client) {
    context.log("App Insights not configured; logging to context only.", {
      ...input,
    });
    return { tracked: false };
  }

  client.trackEvent({
    name: "ChatOrchestrationCompleted",
    properties: {
      sessionId: input.sessionId,
      intent: input.intent,
      agent: input.agent,
      instanceId: input.instanceId,
    },
    measurements: {
      latencyMs: input.latencyMs,
      inputTokens: input.tokenUsage.input,
      outputTokens: input.tokenUsage.output,
    },
  });
  return { tracked: true };
}

df.app.activity("trackTelemetry", { handler: trackTelemetry });
