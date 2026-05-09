"use client";

import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Map, MessageSquare, Settings } from "lucide-react";

export type ViewKey = "chat" | "map" | "settings";

const NAV: { key: ViewKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "map", label: "Map", icon: Map },
  { key: "settings", label: "Settings", icon: Settings },
];

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.21c0 4.51 2.87 8.33 6.84 9.68.5.09.68-.22.68-.49v-1.71c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.13-4.55-5.04 0-1.11.39-2.02 1.03-2.74-.1-.26-.45-1.29.1-2.69 0 0 .84-.27 2.75 1.04.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.31 2.75-1.04 2.75-1.04.55 1.4.2 2.43.1 2.69.64.72 1.03 1.63 1.03 2.74 0 3.92-2.34 4.78-4.57 5.03.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49C19.14 20.54 22 16.72 22 12.21 22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

interface Props {
  activeView: ViewKey;
  onChange: (view: ViewKey) => void;
}

export function SiteHeader({ activeView, onChange }: Props) {
  return (
    <header className="border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-6 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <div className="ring-border/40 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-sm ring-1">
          <Logo size={26} />
        </div>
        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="text-foreground truncate text-sm font-semibold tracking-tight">
            PoC disaster prevention Chat
          </span>
          <span className="text-muted-foreground truncate text-xs">
            Multi-agent disaster preparedness assistant
          </span>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="bg-muted/60 ring-border/50 flex items-center gap-1 rounded-full p-1 ring-1"
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden md:inline-flex">
          PoC
        </Badge>
        <a
          href="https://github.com/SatakeYusuke19920527/poc-disaster-prevention"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition"
          aria-label="GitHub repository"
        >
          <GithubIcon className="h-4 w-4" />
          <span className="hidden lg:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
}
