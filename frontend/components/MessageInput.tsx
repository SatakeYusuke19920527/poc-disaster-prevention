"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      submit(e as unknown as FormEvent);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="border-border/60 bg-background border-t p-4"
    >
      <div className="border-border/60 focus-within:border-primary/60 focus-within:ring-primary/20 mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-white p-2 shadow-sm transition focus-within:ring-4 dark:bg-neutral-900">
        <textarea
          className="placeholder:text-muted-foreground min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm focus:outline-none disabled:opacity-50"
          rows={1}
          placeholder="質問を入力 (Cmd/Ctrl + Enter で送信)"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            setValue(e.target.value);
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = `${Math.min(t.scrollHeight, 200)}px`;
          }}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !value.trim()}
          className="h-9 w-9 shrink-0 rounded-xl"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-muted-foreground mt-2 text-center text-[11px]">
        本サービスは PoC です。回答の正確性は保証されません。
      </p>
    </form>
  );
}
