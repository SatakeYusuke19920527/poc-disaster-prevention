import { Loader2 } from "lucide-react";

export function LoadingIndicator({ label }: { label?: string }) {
  return (
    <div className="text-muted-foreground mx-auto flex max-w-3xl items-center gap-2 px-6 py-3 text-sm">
      <Loader2 className="text-primary h-4 w-4 animate-spin" />
      <span>{label ?? "応答を生成中…"}</span>
    </div>
  );
}
