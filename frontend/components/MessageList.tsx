"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatMessage } from "@/lib/types";
import { Bot, ExternalLink, ShieldAlert, User } from "lucide-react";

interface Props {
  messages: ChatMessage[];
}

const AGENT_LABEL: Record<string, string> = {
  furusato: "ふるさとエージェント",
  "disaster-simulation": "防災シミュレーション",
  "disaster-learning": "防災学習",
  "multi-agent": "マルチエージェント",
};

const SUGGESTIONS = [
  "地震が起きたら最初に何をすればいい？",
  "津波警報が出たときの避難行動は？",
  "家庭での備蓄品リストを教えて",
  "ハザードマップの見方を教えて",
];

export function MessageList({ messages }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-md">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-foreground text-lg font-semibold">
            PoC disaster prevention Chat
          </h3>
          <p className="text-muted-foreground text-sm">
            防災・災害対策に関する質問にマルチエージェントが回答します。
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <Card
              key={s}
              className="hover:border-primary/40 hover:bg-accent/40 cursor-default border-dashed transition"
            >
              <CardContent className="px-4 py-3 text-left text-sm">
                {s}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message: m }: { message: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar className="ring-border/60 h-8 w-8 ring-1">
        <AvatarFallback
          className={
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-br from-blue-600 to-sky-500 text-white"
          }
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex max-w-[80%] flex-col gap-1.5 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {!isUser && m.agent && (
          <Badge variant="secondary" className="text-[10px] font-medium">
            {AGENT_LABEL[m.agent] ?? m.agent}
          </Badge>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card text-card-foreground border-border/60 rounded-tl-sm border"
          }`}
        >
          {m.content}
        </div>

        {!isUser && m.citations && m.citations.length > 0 && (
          <div className="border-border/40 bg-muted/40 mt-1 w-full rounded-xl border px-3 py-2">
            <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
              出典
            </p>
            <ul className="space-y-1">
              {m.citations.map((c, i) => (
                <li
                  key={i}
                  className="text-muted-foreground flex items-start gap-1.5 text-xs leading-snug"
                >
                  <span className="text-muted-foreground/60 select-none">
                    {i + 1}.
                  </span>
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary inline-flex items-start gap-1 underline-offset-2 hover:underline"
                    >
                      <span>{c.title ?? c.source ?? c.url}</span>
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span>{c.title ?? c.source ?? "出典"}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
