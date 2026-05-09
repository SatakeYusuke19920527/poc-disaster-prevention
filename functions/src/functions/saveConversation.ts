import * as df from "durable-functions";
import { InvocationContext } from "@azure/functions";
import { getConversationsContainer } from "../services/cosmosClient";
import type { AgentOutput, ConversationTurn } from "../types/chat";

interface Input {
  sessionId: string;
  userId: string;
  userMessage: string;
  assistantOutput: AgentOutput;
  timestamp: string;
}

const MAX_TURNS = 50;

export async function saveConversation(
  input: Input,
  context: InvocationContext
): Promise<{ saved: boolean }> {
  const container = getConversationsContainer();
  if (!container) {
    context.log("Cosmos not configured; skipping save.");
    return { saved: false };
  }

  let existing: { turns?: ConversationTurn[] } | undefined;
  try {
    const { resource } = await container
      .item(input.sessionId, input.userId)
      .read<{ turns?: ConversationTurn[] }>();
    existing = resource ?? undefined;
  } catch (e) {
    const code = (e as { code?: number }).code;
    if (code !== 404) throw e;
  }

  const turns: ConversationTurn[] = existing?.turns ?? [];
  turns.push({
    role: "user",
    content: input.userMessage,
    timestamp: input.timestamp,
  });
  turns.push({
    role: "assistant",
    content: input.assistantOutput.answer,
    agent: input.assistantOutput.agent,
    timestamp: input.timestamp,
  });

  const doc = {
    id: input.sessionId,
    userId: input.userId,
    turns: turns.slice(-MAX_TURNS),
    updatedAt: input.timestamp,
  };

  await container.items.upsert(doc);
  return { saved: true };
}

df.app.activity("saveConversation", { handler: saveConversation });
