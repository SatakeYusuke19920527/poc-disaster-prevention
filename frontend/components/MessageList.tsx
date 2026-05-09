"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

interface Props {
  messages: ChatMessage[];
}

const AGENT_LABEL: Record<string, string> = {
  furusato: "ふるさとエージェント",
  "disaster-simulation": "防災シミュレーション",
  "disaster-learning": "防災学習",
  "multi-agent": "マルチエージェント",
};

export function MessageList({ messages }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto px-4 py-3">
      {messages.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          メッセージを入力して防災エージェントに質問してください。
        </p>
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {m.role === "assistant" && m.agent && (
              <div className="mb-1 text-xs font-semibold text-gray-500">
                {AGENT_LABEL[m.agent] ?? m.agent}
              </div>
            )}
            <div>{m.content}</div>
            {m.citations && m.citations.length > 0 && (
              <ul className="mt-2 space-y-1 border-t border-gray-200 pt-2 text-xs text-gray-600">
                {m.citations.map((c, i) => (
                  <li key={i}>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {c.title ?? c.source ?? c.url}
                      </a>
                    ) : (
                      <span>{c.title ?? c.source ?? "出典"}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
