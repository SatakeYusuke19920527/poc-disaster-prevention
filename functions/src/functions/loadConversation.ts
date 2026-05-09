import * as df from "durable-functions";
import { InvocationContext } from "@azure/functions";
import { getConversationsContainer } from "../services/cosmosClient";
import type { ConversationTurn } from "../types/chat";

interface Input {
  sessionId: string;
  userId: string;
}

const MAX_TURNS = 20;

export async function loadConversation(
  input: Input,
  context: InvocationContext
): Promise<ConversationTurn[]> {
  const container = getConversationsContainer();
  if (!container) {
    context.log("Cosmos not configured; returning empty history.");
    return [];
  }
  try {
    const { resource } = await container
      .item(input.sessionId, input.userId)
      .read<{ turns?: ConversationTurn[] }>();
    const turns = resource?.turns ?? [];
    return turns.slice(-MAX_TURNS);
  } catch (e: unknown) {
    const code = (e as { code?: number }).code;
    if (code === 404) return [];
    context.error("loadConversation failed", e);
    return [];
  }
}

df.app.activity("loadConversation", { handler: loadConversation });
