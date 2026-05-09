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

export interface ChatResponseMetadata {
  intent?: string;
  latencyMs?: number;
  tokenUsage?: TokenUsage;
}

export interface ChatResponse {
  answer: string;
  agent: AgentName;
  citations: Citation[];
  metadata: ChatResponseMetadata;
}

export interface StartChatResponse {
  instanceId: string;
  statusQueryGetUri?: string;
}

export type OrchestrationRuntimeStatus =
  | "Pending"
  | "Running"
  | "Completed"
  | "Failed"
  | "Terminated"
  | "Canceled";

export interface OrchestrationStatus {
  instanceId: string;
  runtimeStatus: OrchestrationRuntimeStatus;
  output?: ChatResponse;
  customStatus?: unknown;
  createdTime?: string;
  lastUpdatedTime?: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  agent?: AgentName;
  citations?: Citation[];
  createdAt: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  distanceMeters: number;
}

export interface NearbySheltersResponse {
  shelters: Shelter[];
}

export interface WalkingRoute {
  distanceMeters: number;
  travelTimeSeconds: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}
