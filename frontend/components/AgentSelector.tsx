"use client";

import type { AgentMode } from "@/lib/types";

const OPTIONS: { value: AgentMode; label: string }[] = [
  { value: "auto", label: "自動選択" },
  { value: "furusato", label: "ふるさと" },
  { value: "disaster-simulation", label: "防災シミュレーション" },
  { value: "disaster-learning", label: "防災学習" },
];

interface Props {
  value: AgentMode;
  onChange: (value: AgentMode) => void;
  disabled?: boolean;
}

export function AgentSelector({ value, onChange, disabled }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">エージェント:</span>
      <select
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as AgentMode)}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
