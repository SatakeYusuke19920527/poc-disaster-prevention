import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getWalkingRoute } from "../services/azureMaps";
import type { LatLng } from "../types/maps";

interface RouteRequestBody {
  from?: Partial<LatLng>;
  to?: Partial<LatLng>;
}

function isValidLatLng(v: unknown): v is LatLng {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.lat === "number" &&
    typeof o.lng === "number" &&
    Number.isFinite(o.lat) &&
    Number.isFinite(o.lng) &&
    o.lat >= -90 &&
    o.lat <= 90 &&
    o.lng >= -180 &&
    o.lng <= 180
  );
}

export async function getWalkingRouteHttp(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  let body: RouteRequestBody;
  try {
    body = (await req.json()) as RouteRequestBody;
  } catch {
    return { status: 400, jsonBody: { error: "Invalid JSON body." } };
  }

  if (!isValidLatLng(body.from) || !isValidLatLng(body.to)) {
    return {
      status: 400,
      jsonBody: { error: "Both 'from' and 'to' with valid lat/lng are required." },
    };
  }

  try {
    const route = await getWalkingRoute(body.from, body.to);
    return { status: 200, jsonBody: route };
  } catch (e) {
    context.error("getWalkingRoute failed", e);
    const message = e instanceof Error ? e.message : "Unknown error.";
    return { status: 502, jsonBody: { error: message } };
  }
}

app.http("getWalkingRoute", {
  route: "route/walk",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: getWalkingRouteHttp,
});
