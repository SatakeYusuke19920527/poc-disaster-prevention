"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { MapPanel } from "@/components/MapPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SiteHeader, type ViewKey } from "@/components/SiteHeader";

export function AppShell() {
  const [view, setView] = useState<ViewKey>("chat");

  return (
    <div className="flex h-screen w-full flex-col">
      <SiteHeader activeView={view} onChange={setView} />
      <main className="flex-1 overflow-hidden">
        {view === "chat" && <ChatWindow />}
        {view === "map" && <MapPanel />}
        {view === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}
