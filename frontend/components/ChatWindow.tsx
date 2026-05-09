"use client";

import { useCallback, useRef, useState } from "react";
import { AgentSelector } from "./AgentSelector";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingIndicator } from "./LoadingIndicator";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { pollChatUntilComplete, startChat } from "@/lib/api";
import { getOrCreateSessionId, getOrCreateUserId } from "@/lib/session";
import type { AgentMode, ChatMessage } from "@/lib/types";

function newMessageId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentMode, setAgentMode] = useState<AgentMode>("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastMessageRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (message: string) => {
      const sessionId = getOrCreateSessionId();
      const userId = getOrCreateUserId();
      setError(null);
      lastMessageRef.current = message;

      const userMsg: ChatMessage = {
        id: newMessageId(),
        role: "user",
        content: message,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const start = await startChat(
          { sessionId, userId, message, agentMode },
          ac.signal
        );
        const result = await pollChatUntilComplete(start.instanceId, {
          signal: ac.signal,
        });
        const assistantMsg: ChatMessage = {
          id: newMessageId(),
          role: "assistant",
          content: result.answer,
          agent: result.agent,
          citations: result.citations,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "通信に失敗しました。";
        setError(msg);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [agentMode]
  );

  const retry = useCallback(() => {
    if (lastMessageRef.current) {
      const last = lastMessageRef.current;
      setMessages((prev) =>
        prev[prev.length - 1]?.role === "user" ? prev.slice(0, -1) : prev
      );
      void send(last);
    }
  }, [send]);

  return (
    <section className="bg-muted/20 flex h-full w-full flex-col">
      <div className="flex items-center justify-end px-6 pt-3">
        <AgentSelector
          value={agentMode}
          onChange={setAgentMode}
          disabled={isLoading}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
        {isLoading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} onRetry={retry} />}
      </div>

      <MessageInput onSend={send} disabled={isLoading} />
    </section>
  );
}
