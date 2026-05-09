function randomId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${rand}`;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return randomId("session");
  }
  const key = "poc-disaster.sessionId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = randomId("session");
  window.localStorage.setItem(key, created);
  return created;
}

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") {
    return randomId("user");
  }
  const key = "poc-disaster.userId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = randomId("user");
  window.localStorage.setItem(key, created);
  return created;
}
