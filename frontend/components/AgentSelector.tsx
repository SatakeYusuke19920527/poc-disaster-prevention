"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgentMode } from "@/lib/types";
import { Bot, GraduationCap, MapPin, Sparkles } from "lucide-react";

const OPTIONS: {
  value: AgentMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "auto", label: "自動選択", icon: Sparkles },
  { value: "furusato", label: "ふるさと", icon: MapPin },
  { value: "disaster-simulation", label: "防災シミュレーション", icon: Bot },
  { value: "disaster-learning", label: "防災学習", icon: GraduationCap },
];

interface Props {
  value: AgentMode;
  onChange: (value: AgentMode) => void;
  disabled?: boolean;
}

export function AgentSelector({ value, onChange, disabled }: Props) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as AgentMode)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[210px]">
        <SelectValue placeholder="エージェントを選択" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          return (
            <SelectItem key={o.value} value={o.value}>
              <span className="flex items-center gap-2">
                <Icon className="text-muted-foreground h-4 w-4" />
                {o.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
