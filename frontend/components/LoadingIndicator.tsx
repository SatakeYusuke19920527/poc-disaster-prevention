export function LoadingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-blue-500" />
      <span>{label ?? "応答を生成中..."}</span>
    </div>
  );
}
