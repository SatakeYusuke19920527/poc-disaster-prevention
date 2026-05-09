import { env } from "../shared/env";
import type { LatLng, WalkingRouteResponse } from "../types/maps";

const ROUTE_BASE = "https://atlas.microsoft.com/route/directions/json";
const API_VERSION = "1.0";

interface RouteApiLeg {
  summary: { lengthInMeters: number; travelTimeInSeconds: number };
  points: { latitude: number; longitude: number }[];
}

interface RouteApiResponse {
  routes: Array<{
    summary: { lengthInMeters: number; travelTimeInSeconds: number };
    legs: RouteApiLeg[];
  }>;
}

export async function getWalkingRoute(
  from: LatLng,
  to: LatLng
): Promise<WalkingRouteResponse> {
  const key = env.maps.subscriptionKey();
  const query = `${from.lat},${from.lng}:${to.lat},${to.lng}`;
  const url = new URL(ROUTE_BASE);
  url.searchParams.set("api-version", API_VERSION);
  url.searchParams.set("subscription-key", key);
  url.searchParams.set("query", query);
  url.searchParams.set("travelMode", "pedestrian");
  url.searchParams.set("routeType", "shortest");
  url.searchParams.set("traffic", "false");

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Azure Maps Route failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as RouteApiResponse;
  const route = data.routes?.[0];
  if (!route) {
    throw new Error("Azure Maps Route returned no routes.");
  }

  const coords: [number, number][] = [];
  for (const leg of route.legs) {
    for (const p of leg.points) {
      coords.push([p.longitude, p.latitude]);
    }
  }

  return {
    distanceMeters: route.summary.lengthInMeters,
    travelTimeSeconds: route.summary.travelTimeInSeconds,
    geometry: { type: "LineString", coordinates: coords },
  };
}
