"use client";

import { useState, FormEvent, KeyboardEvent } from "react";

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
      className="flex items-end gap-2 border-t border-gray-200 bg-white p-3"
    >
      <textarea
        className="flex-1 resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        rows={2}
        placeholder="質問を入力 (Cmd/Ctrl+Enter で送信)"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        送信
      </button>
    </form>
  );
}
