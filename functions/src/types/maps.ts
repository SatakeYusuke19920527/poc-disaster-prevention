export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
}

export interface ShelterWithDistance extends Shelter {
  distanceMeters: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface WalkingRouteResponse {
  distanceMeters: number;
  travelTimeSeconds: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}
