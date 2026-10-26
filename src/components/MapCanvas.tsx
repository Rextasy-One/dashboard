'use client';

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

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
 */
export function MapCanvas({ fallback }: MapCanvasProps) {
  // Derived, not set in an effect: a browser without geolocation is known before the
  // first render, so the fallback needs no state update.
  const hasGeolocation = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
  const [center, setCenter] = useState<Center>(hasGeolocation ? FALLBACK_CENTER : FALLBACK_CENTER);
  const [located, setLocated] = useState(false);

  useEffect(() => {
    if (!hasGeolocation) return;

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocated(true);
      },
      () => {
        // Denied or unavailable. Silent by design; the fallback centre stands.
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );

    return () => {
      cancelled = true;
    };
  }, [hasGeolocation]);

  if (!API_KEY) return <>{fallback}</>;

  return (
    <div className="h-96 overflow-hidden rounded-lg border border-slate-300">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={located ? LOCATED_ZOOM : FALLBACK_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        />
      </APIProvider>
    </div>
  );
}
