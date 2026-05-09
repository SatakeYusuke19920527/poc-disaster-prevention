export type AgentMode =
  | "auto"
  | "furusato"
  | "disaster-simulation"
  | "disaster-learning";

export type AgentName =
  | "furusato"
  | "disaster-simulation"
  | "disaster-learning"
  | "multi-agent";

export type Confidence = "low" | "medium" | "high";

export interface ChatRequest {
  sessionId: string;
  userId: string;
  message: string;
  agentMode: AgentMode;
}

export interface Citation {
  title?: string;
  source?: string;
  url?: string;
  score?: number;
}

export interface TokenUsage {
  input: number;
  output: number;
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
  agent?: AgentName;
  timestamp: string;
}

export interface RetrievedDocument {
  title: string;
  content: string;
  source: string;
  url?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface IntentResult {
  intent: string;
  agent: AgentName;
  needsRetrieval: boolean;
  confidence: Confidence;
}

export interface AgentInput {
  message: string;
  history: ConversationTurn[];
  documents: RetrievedDocument[];
  intent: string;
}

export interface AgentOutput {
  agent: AgentName;
  answer: string;
  citations: Citation[];
  confidence: Confidence;
  safetyNotes: string[];
  tokenUsage: TokenUsage;
}

export interface OrchestratorInput {
  request: ChatRequest;
  startedAtMs: number;
}

export interface OrchestratorOutput {
  answer: string;
  agent: AgentName;
  citations: Citation[];
  metadata: {
    intent: string;
    latencyMs: number;
    tokenUsage: TokenUsage;
  };
}
