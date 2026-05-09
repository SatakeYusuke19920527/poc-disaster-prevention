import type { AgentMode, ChatRequest } from "../types/chat";

const ALLOWED_MODES: AgentMode[] = [
  "auto",
  "furusato",
  "disaster-simulation",
  "disaster-learning",
];

const MAX_MESSAGE_LENGTH = 4000;

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function validateChatRequest(payload: unknown): ChatRequest {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError("Request body must be a JSON object.");
  }
  const p = payload as Record<string, unknown>;

  if (!isString(p.sessionId) || p.sessionId.length === 0) {
    throw new ValidationError("sessionId is required.");
  }
  if (!isString(p.userId) || p.userId.length === 0) {
    throw new ValidationError("userId is required.");
  }
  if (!isString(p.message) || p.message.trim().length === 0) {
    throw new ValidationError("message is required.");
  }
  if (p.message.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(
      `message exceeds max length of ${MAX_MESSAGE_LENGTH}.`
    );
  }

  const agentMode = (p.agentMode ?? "auto") as AgentMode;
  if (!ALLOWED_MODES.includes(agentMode)) {
    throw new ValidationError(`agentMode must be one of ${ALLOWED_MODES.join(", ")}`);
  }

  return {
    sessionId: p.sessionId,
    userId: p.userId,
    message: p.message,
    agentMode,
  };
}
