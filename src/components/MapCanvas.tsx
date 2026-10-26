'use client';

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { MapDebugPanel, type DebugInfo } from './MapDebugPanel';

/**
 * Fallback centre when the browser will not provide a location, or the user denies
 * the prompt. Denver, chosen arbitrarily.
 */
const FALLBACK_CENTER = { lat: 39.7392, lng: -104.9903 };
const FALLBACK_ZOOM = 10;

/** Close enough to a street to be useful, without implying precision. */
const LOCATED_ZOOM = 13;

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Center = { lat: number; lng: number };
type GeoResult = DebugInfo['geolocationResult'];

export interface MapCanvasProps {
  /** Rendered when the key is absent, instead of attempting to load the SDK. */
  fallback: React.ReactNode;
}

/**
 * Interactive map.
 *
 * Geolocation only sets the initial centre. There is no marker, and the map is not
 * recentred after load, so the user can pan without being pulled back. Denial or
 * failure falls back to a default centre silently.
 *
 * Do NOT extract the `typeof window !== 'undefined'` check into a constant, a helper,
 * or a useState initialiser. Three broken attempts, all hydration mismatches:
 *
 *   1. `typeof navigator !== 'undefined'` — Next defines `navigator` during server
 *      rendering, so this is TRUE on the server. Wrong signal, and it cannot be fixed
 *      by moving it around.
 *   2. A module-scope `const isClient = ...` — evaluated once per process. The server
 *      captures `false` and that value is replayed for every client.
 *   3. A `useState(() => ...)` initialiser — still runs during server rendering, so
 *      the server and client disagree on the first render.
 *
 * Inline is the only placement that is correct, because the expression must be
 * re-evaluated per render in the environment that render belongs to.
 */
export function MapCanvas({ fallback }: MapCanvasProps) {
  const [center, setCenter] = useState<Center>(FALLBACK_CENTER);
  const [located, setLocated] = useState(false);
  const [geoResult, setGeoResult] = useState<GeoResult>('pending');
  /**
   * Null until the browser reports. Null renders as "unknown" on both server and
   * client, so the first client render matches the server exactly.
   *
   * The check itself lives in the effect, where `window` definitively exists. Any
   * version of it during render — inline, module-scope, or in a state initialiser —
   * produces a mismatch, because the server render evaluates the branch too.
   */
  const [geoSupported, setGeoSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!window.navigator.geolocation) return;

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setGeoSupported(true);
        setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocated(true);
        setGeoResult('granted');
      },
      (error) => {
        if (cancelled) return;
        setGeoSupported(true);
        // Denied or unavailable. Silent by design; the fallback centre stands.
        setGeoResult(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const info: DebugInfo = {
    keyPresent: Boolean(API_KEY),
    keySuffix: API_KEY ? API_KEY.slice(-6) : '',
    geolocationSupported: geoSupported,
    geolocationResult: geoResult,
    coords: located ? center : null,
  };

  if (!API_KEY) {
    return (
      <>
        {fallback}
        <MapDebugPanel info={info} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-96 overflow-hidden rounded-lg border border-slate-300">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={center}
            defaultZoom={located ? LOCATED_ZOOM : FALLBACK_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
          />
          {/* Inside APIProvider so the SDK status hook has its context. */}
          <MapDebugPanel info={info} />
        </APIProvider>
      </div>
    </div>
  );
}
