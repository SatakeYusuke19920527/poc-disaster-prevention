import type { LatLng, Shelter, ShelterWithDistance } from "../types/maps";

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

export function rankSheltersByDistance(
  origin: LatLng,
  shelters: Shelter[],
  topK: number
): ShelterWithDistance[] {
  return shelters
    .map((s) => ({
      ...s,
      distanceMeters: haversineDistanceMeters(origin, { lat: s.lat, lng: s.lng }),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, Math.max(1, Math.min(topK, shelters.length)));
}
