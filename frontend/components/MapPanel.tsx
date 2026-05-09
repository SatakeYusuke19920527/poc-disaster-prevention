"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getNearbyShelters, getWalkingRoute } from "@/lib/api";
import type { LatLng, Shelter, WalkingRoute } from "@/lib/types";
import {
  AlertTriangle,
  Loader2,
  LocateFixed,
  Map as MapIcon,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "azure-maps-control/dist/atlas.min.css";

const AZURE_MAPS_KEY = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY ?? "";

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

function formatDuration(sec: number): string {
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} 分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} 時間 ${m} 分`;
}

export function MapPanel() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // We type as `unknown` then cast inside, to avoid bundling azure-maps types
  // into the SSR build (the package is dynamic-imported only on client).
  const mapRef = useRef<unknown>(null);
  const atlasRef = useRef<unknown>(null);
  const sheltersDsRef = useRef<unknown>(null);
  const routeDsRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);

  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [route, setRoute] = useState<WalkingRoute | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingState, setLoadingState] = useState<
    "idle" | "locating" | "fetching-shelters" | "routing"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // 1. Initialize Azure Maps on client
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!AZURE_MAPS_KEY) {
      setError(
        "NEXT_PUBLIC_AZURE_MAPS_KEY が設定されていません。Settings から確認してください。"
      );
      return;
    }

    let cancelled = false;
    (async () => {
      const atlas = await import("azure-maps-control");

      if (cancelled || !mapContainerRef.current) return;
      atlasRef.current = atlas;

      const map = new atlas.Map(mapContainerRef.current, {
        center: [139.7671, 35.6812], // Tokyo Station
        zoom: 12,
        view: "Auto",
        language: "ja-JP",
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: AZURE_MAPS_KEY,
        },
        style: "road",
      });

      mapRef.current = map;

      map.events.add("ready", () => {
        const sheltersDs = new atlas.source.DataSource();
        const routeDs = new atlas.source.DataSource();
        map.sources.add(sheltersDs);
        map.sources.add(routeDs);
        sheltersDsRef.current = sheltersDs;
        routeDsRef.current = routeDs;

        map.layers.add(
          new atlas.layer.LineLayer(routeDs, undefined, {
            strokeColor: "#2563eb",
            strokeWidth: 5,
            lineJoin: "round",
            lineCap: "round",
          })
        );

        map.layers.add(
          new atlas.layer.SymbolLayer(sheltersDs, undefined, {
            iconOptions: {
              image: "marker-blue",
              allowOverlap: true,
              ignorePlacement: true,
            },
            textOptions: {
              textField: ["get", "name"],
              offset: [0, 1.4],
              size: 12,
              haloColor: "#ffffff",
              haloWidth: 2,
            },
          })
        );

        setMapReady(true);
      });
    })().catch((e) => {
      console.error("Azure Maps init failed", e);
      setError("地図の初期化に失敗しました。");
    });

    return () => {
      cancelled = true;
      const m = mapRef.current as { dispose?: () => void } | null;
      m?.dispose?.();
      mapRef.current = null;
    };
  }, []);

  // 2. Get geolocation (manual trigger)
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("このブラウザは位置情報に対応していません。");
      return;
    }
    setLoadingState("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const o: LatLng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setOrigin(o);
        setLoadingState("idle");
      },
      (err) => {
        console.error(err);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "位置情報の利用が許可されていません。ブラウザの設定で許可してください。"
            : "位置情報の取得に失敗しました。"
        );
        setLoadingState("idle");
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  // 3. When origin set, render user marker, fetch nearby shelters
  useEffect(() => {
    if (!origin || !mapReady || !mapRef.current || !atlasRef.current) return;

    const atlas = atlasRef.current as typeof import("azure-maps-control");
    const map = mapRef.current as InstanceType<typeof atlas.Map>;
    const userMarker = userMarkerRef.current as
      | InstanceType<typeof atlas.HtmlMarker>
      | null;

    if (userMarker) {
      map.markers.remove(userMarker);
    }

    const newUserMarker = new atlas.HtmlMarker({
      position: [origin.lng, origin.lat],
      htmlContent:
        '<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb40;"></div>',
    });
    map.markers.add(newUserMarker);
    userMarkerRef.current = newUserMarker;

    map.setCamera({
      center: [origin.lng, origin.lat],
      zoom: 14,
      type: "ease",
      duration: 600,
    });

    setLoadingState("fetching-shelters");
    const ac = new AbortController();
    getNearbyShelters(origin, 5, ac.signal)
      .then((res) => {
        setShelters(res.shelters);
        setSelectedShelter(res.shelters[0] ?? null);
        setLoadingState("idle");
      })
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError(`避難所の取得に失敗しました: ${(e as Error).message}`);
        setLoadingState("idle");
      });
    return () => ac.abort();
  }, [origin, mapReady]);

  // 4. Update shelter markers when shelters change
  useEffect(() => {
    if (!sheltersDsRef.current || !atlasRef.current) return;
    const atlas = atlasRef.current as typeof import("azure-maps-control");
    const ds = sheltersDsRef.current as InstanceType<typeof atlas.source.DataSource>;
    ds.clear();
    for (const s of shelters) {
      ds.add(
        new atlas.data.Feature(new atlas.data.Point([s.lng, s.lat]), {
          id: s.id,
          name: s.name,
        })
      );
    }
  }, [shelters]);

  // 5. When selected shelter changes, fetch route
  useEffect(() => {
    if (!origin || !selectedShelter) return;
    setLoadingState("routing");
    const ac = new AbortController();
    getWalkingRoute(
      origin,
      { lat: selectedShelter.lat, lng: selectedShelter.lng },
      ac.signal
    )
      .then((r) => {
        setRoute(r);
        setLoadingState("idle");
      })
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError(`ルート取得に失敗しました: ${(e as Error).message}`);
        setLoadingState("idle");
      });
    return () => ac.abort();
  }, [origin, selectedShelter]);

  // 6. Render route on map
  useEffect(() => {
    if (!routeDsRef.current || !atlasRef.current) return;
    const atlas = atlasRef.current as typeof import("azure-maps-control");
    const ds = routeDsRef.current as InstanceType<typeof atlas.source.DataSource>;
    ds.clear();
    if (!route) return;
    ds.add(
      new atlas.data.Feature(
        new atlas.data.LineString(route.geometry.coordinates)
      )
    );

    if (mapRef.current && route.geometry.coordinates.length > 1) {
      const map = mapRef.current as InstanceType<typeof atlas.Map>;
      const lons = route.geometry.coordinates.map((c) => c[0]);
      const lats = route.geometry.coordinates.map((c) => c[1]);
      const bbox: [number, number, number, number] = [
        Math.min(...lons),
        Math.min(...lats),
        Math.max(...lons),
        Math.max(...lats),
      ];
      map.setCamera({
        bounds: bbox,
        padding: 80,
        type: "ease",
        duration: 600,
      });
    }
  }, [route]);

  return (
    <section className="bg-muted/20 flex h-full w-full">
      {/* Sidebar */}
      <aside className="border-border/60 bg-background hidden w-80 shrink-0 flex-col border-r md:flex">
        <div className="border-border/60 border-b px-5 py-4">
          <div className="mb-1 flex items-center gap-2">
            <MapIcon className="text-muted-foreground h-4 w-4" />
            <h2 className="text-foreground text-sm font-semibold">
              最寄りの避難所
            </h2>
          </div>
          <p className="text-muted-foreground text-xs">
            位置情報を許可すると、最寄り避難所と徒歩ルートを表示します。
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            disabled={loadingState === "locating"}
            className="mt-3 w-full gap-1.5"
          >
            {loadingState === "locating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            現在位置を取得
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {!origin && (
            <p className="text-muted-foreground px-2 py-6 text-center text-xs">
              「現在位置を取得」を押してください。
            </p>
          )}

          {origin && shelters.length === 0 && loadingState === "fetching-shelters" && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              避難所を検索中…
            </div>
          )}

          <ul className="space-y-2">
            {shelters.map((s) => {
              const isSelected = selectedShelter?.id === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedShelter(s)}
                    className={cn(
                      "border-border/60 hover:border-primary/50 hover:bg-accent/40 w-full rounded-xl border px-3 py-2.5 text-left transition",
                      isSelected && "border-primary/60 bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {s.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {s.address}
                        </p>
                      </div>
                      {isSelected && route && (
                        <Navigation className="text-primary h-4 w-4 shrink-0" />
                      )}
                    </div>
                    <div className="text-muted-foreground mt-1.5 flex items-center gap-3 text-xs">
                      <span>距離 {formatDistance(s.distanceMeters)}</span>
                      {isSelected && route && (
                        <span>徒歩 {formatDuration(route.travelTimeSeconds)}</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Map */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {!mapReady && !error && (
          <div className="bg-background/60 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              地図を読み込み中…
            </div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 absolute top-4 right-4 left-4 mx-auto max-w-md md:left-auto">
            <CardContent className="text-destructive flex items-start gap-2 px-4 py-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Mobile floating action */}
        <div className="absolute right-4 bottom-4 md:hidden">
          <Button
            size="sm"
            onClick={requestLocation}
            disabled={loadingState === "locating"}
            className="gap-1.5 shadow-lg"
          >
            {loadingState === "locating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            現在位置
          </Button>
        </div>
      </div>
    </section>
  );
}
