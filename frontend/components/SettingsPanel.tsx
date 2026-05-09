"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrCreateSessionId, getOrCreateUserId } from "@/lib/session";
import type { AgentMode } from "@/lib/types";
import { RotateCcw, Save } from "lucide-react";

const AGENT_OPTIONS: { value: AgentMode; label: string }[] = [
  { value: "auto", label: "自動選択" },
  { value: "furusato", label: "ふるさと" },
  { value: "disaster-simulation", label: "防災シミュレーション" },
  { value: "disaster-learning", label: "防災学習" },
];

const PREFS_KEY = "poc-dp-chat:preferences";

interface Preferences {
  defaultAgent: AgentMode;
  displayName: string;
}

const DEFAULT_PREFS: Preferences = {
  defaultAgent: "auto",
  displayName: "",
};

function loadPrefs(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function SettingsPanel() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setPrefs(loadPrefs());
    setSessionId(getOrCreateSessionId());
    setUserId(getOrCreateUserId());
  }, []);

  function save() {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSavedAt(Date.now());
  }

  function resetSession() {
    window.localStorage.removeItem("poc-disaster.sessionId");
    window.localStorage.removeItem("poc-disaster.userId");
    setSessionId(getOrCreateSessionId());
    setUserId(getOrCreateUserId());
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "(not configured)";

  return (
    <section className="bg-muted/20 flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                placeholder="あなたの名前"
                value={prefs.displayName}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, displayName: e.target.value }))
                }
              />
              <p className="text-muted-foreground text-xs">
                チャット内の表示で利用されます。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultAgent">デフォルトエージェント</Label>
              <Select
                value={prefs.defaultAgent}
                onValueChange={(v) =>
                  setPrefs((p) => ({ ...p, defaultAgent: v as AgentMode }))
                }
              >
                <SelectTrigger id="defaultAgent" className="w-full sm:w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={save} className="gap-1.5">
                <Save className="h-4 w-4" />
                保存
              </Button>
              {savedAt && (
                <span className="text-muted-foreground text-xs">
                  保存しました（
                  {new Date(savedAt).toLocaleTimeString()}）
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">セッション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs">
                Session ID
              </Label>
              <code className="bg-muted text-foreground rounded-md px-3 py-2 font-mono text-xs break-all">
                {sessionId || "—"}
              </code>
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs">User ID</Label>
              <code className="bg-muted text-foreground rounded-md px-3 py-2 font-mono text-xs break-all">
                {userId || "—"}
              </code>
            </div>
            <Separator />
            <Button variant="outline" onClick={resetSession} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              セッションをリセット
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">接続情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              API Base URL
            </Label>
            <code className="bg-muted text-foreground block rounded-md px-3 py-2 font-mono text-xs break-all">
              {apiBase}
            </code>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
