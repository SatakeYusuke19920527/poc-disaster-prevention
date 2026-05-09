export class AgentError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export function safeErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export function userFacingError(e: unknown): string {
  const msg = safeErrorMessage(e);
  if (
    msg.toLowerCase().includes("api key") ||
    msg.toLowerCase().includes("token") ||
    msg.toLowerCase().includes("connection string")
  ) {
    return "内部設定エラーが発生しました。管理者にお問い合わせください。";
  }
  return "エージェントの実行中にエラーが発生しました。再試行してください。";
}
