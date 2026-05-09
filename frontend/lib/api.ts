import type {
  ChatRequest,
  ChatResponse,
  LatLng,
  NearbySheltersResponse,
  OrchestrationStatus,
  StartChatResponse,
  WalkingRoute,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function buildUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. Set it in frontend/.env.local."
    );
  }
  const base = API_BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function startChat(
  payload: ChatRequest,
  signal?: AbortSignal
): Promise<StartChatResponse> {
  const res = await fetch(buildUrl("/api/chat/start"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    throw new Error(`startChat failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as StartChatResponse;
}

export async function getChatStatus(
  instanceId: string,
  signal?: AbortSignal
): Promise<OrchestrationStatus> {
  const res = await fetch(
    buildUrl(`/api/chat/status/${encodeURIComponent(instanceId)}`),
    { method: "GET", signal, cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`getChatStatus failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as OrchestrationStatus;
}

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function pollChatUntilComplete(
  instanceId: string,
  options: PollOptions = {}
): Promise<ChatResponse> {
  const intervalMs = options.intervalMs ?? 1000;
  const timeoutMs = options.timeoutMs ?? 120_000;
  const start = Date.now();

  while (true) {
    if (options.signal?.aborted) {
      throw new DOMException("Polling aborted", "AbortError");
    }
    const status = await getChatStatus(instanceId, options.signal);

    if (status.runtimeStatus === "Completed") {
      if (!status.output) {
        throw new Error("Orchestration completed without output.");
      }
      return status.output;
    }
    if (
      status.runtimeStatus === "Failed" ||
      status.runtimeStatus === "Terminated" ||
      status.runtimeStatus === "Canceled"
    ) {
      throw new Error(`Orchestration ${status.runtimeStatus}.`);
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Orchestration timed out.");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function getNearbyShelters(
  origin: LatLng,
  topK = 5,
  signal?: AbortSignal
): Promise<NearbySheltersResponse> {
  const url = buildUrl(
    `/api/shelters/nearby?lat=${origin.lat}&lng=${origin.lng}&topK=${topK}`
  );
  const res = await fetch(url, { method: "GET", signal, cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `getNearbyShelters failed: ${res.status} ${res.statusText}`
    );
  }
  return (await res.json()) as NearbySheltersResponse;
}

export async function getWalkingRoute(
  from: LatLng,
  to: LatLng,
  signal?: AbortSignal
): Promise<WalkingRoute> {
  const res = await fetch(buildUrl("/api/route/walk"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`getWalkingRoute failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as WalkingRoute;
}
