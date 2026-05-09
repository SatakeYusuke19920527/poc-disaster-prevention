import * as df from "durable-functions";
import type {
  AgentInput,
  AgentName,
  AgentOutput,
  ChatRequest,
  ConversationTurn,
  IntentResult,
  OrchestratorInput,
  OrchestratorOutput,
  RetrievedDocument,
} from "../types/chat";

const openAiRetry = new df.RetryOptions(2000, 3);
const searchRetry = new df.RetryOptions(1000, 2);
const cosmosRetry = new df.RetryOptions(1000, 3);

const AGENT_ACTIVITY: Record<
  Exclude<AgentName, "multi-agent">,
  string
> = {
  furusato: "runFurusatoAgent",
  "disaster-simulation": "runDisasterSimulationAgent",
  "disaster-learning": "runDisasterLearningAgent",
};

function selectAgent(
  request: ChatRequest,
  intent: IntentResult
): Exclude<AgentName, "multi-agent"> {
  if (request.agentMode !== "auto") {
    return request.agentMode;
  }
  if (intent.agent === "multi-agent") return "disaster-learning";
  return intent.agent;
}

function* chatOrchestratorGenerator(
  context: df.OrchestrationContext
): Generator<df.Task, OrchestratorOutput, unknown> {
  const input = context.df.getInput() as OrchestratorInput;
  const { request } = input;

  const history = (yield context.df.callActivityWithRetry(
    "loadConversation",
    cosmosRetry,
    { sessionId: request.sessionId, userId: request.userId }
  )) as ConversationTurn[];

  const intent = (yield context.df.callActivityWithRetry(
    "classifyIntent",
    openAiRetry,
    { message: request.message, history }
  )) as IntentResult;

  let documents: RetrievedDocument[] = [];
  if (intent.needsRetrieval) {
    documents = (yield context.df.callActivityWithRetry(
      "retrieveContext",
      searchRetry,
      { query: request.message, intent: intent.intent, topK: 5 }
    )) as RetrievedDocument[];
  }

  const selectedAgent = selectAgent(request, intent);
  const agentInput: AgentInput = {
    message: request.message,
    history,
    documents,
    intent: intent.intent,
  };

  const agentOutput = (yield context.df.callActivityWithRetry(
    AGENT_ACTIVITY[selectedAgent],
    openAiRetry,
    agentInput
  )) as AgentOutput;

  const guarded = (yield context.df.callActivity("applyGuardrails", {
    output: agentOutput,
  })) as AgentOutput;

  yield context.df.callActivityWithRetry("saveConversation", cosmosRetry, {
    sessionId: request.sessionId,
    userId: request.userId,
    userMessage: request.message,
    assistantOutput: guarded,
    timestamp: context.df.currentUtcDateTime.toISOString(),
  });

  const finishedAt = context.df.currentUtcDateTime.getTime();
  const latencyMs = Math.max(0, finishedAt - input.startedAtMs);

  yield context.df.callActivity("trackTelemetry", {
    sessionId: request.sessionId,
    userId: request.userId,
    intent: intent.intent,
    agent: guarded.agent,
    latencyMs,
    tokenUsage: guarded.tokenUsage,
    instanceId: context.df.instanceId,
  });

  const result: OrchestratorOutput = {
    answer: guarded.answer,
    agent: guarded.agent,
    citations: guarded.citations,
    metadata: {
      intent: intent.intent,
      latencyMs,
      tokenUsage: guarded.tokenUsage,
    },
  };
  return result;
}

df.app.orchestration("chatOrchestrator", chatOrchestratorGenerator);
