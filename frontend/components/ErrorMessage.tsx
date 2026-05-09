import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="border-destructive/30 bg-destructive/10 text-destructive mx-auto my-3 flex max-w-3xl items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 h-8"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          再試行
        </Button>
      )}
    </div>
  );
}
