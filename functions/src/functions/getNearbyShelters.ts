import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { rankSheltersByDistance } from "../shared/geo";
import shelters from "../data/shelters.json";
import type { Shelter } from "../types/maps";

const ALL_SHELTERS = shelters as Shelter[];

function parseFloatParam(
  value: string | null | undefined,
  name: string
): number {
  if (value === null || value === undefined || value === "") {
    throw new Error(`Query parameter '${name}' is required.`);
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Query parameter '${name}' must be a number.`);
  }
  return n;
}

export async function getNearbyShelters(
  req: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const lat = parseFloatParam(req.query.get("lat"), "lat");
    const lng = parseFloatParam(req.query.get("lng"), "lng");
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return {
        status: 400,
        jsonBody: { error: "lat/lng out of valid range." },
      };
    }
    const topKRaw = req.query.get("topK");
    const topK = topKRaw ? Math.max(1, Math.min(20, Number(topKRaw))) : 5;
    const ranked = rankSheltersByDistance({ lat, lng }, ALL_SHELTERS, topK);
    return { status: 200, jsonBody: { shelters: ranked } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error.";
    return { status: 400, jsonBody: { error: message } };
  }
}

app.http("getNearbyShelters", {
  route: "shelters/nearby",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getNearbyShelters,
});
