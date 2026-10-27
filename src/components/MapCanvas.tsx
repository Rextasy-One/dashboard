'use client';

import { APIProvider, Map, type MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useState } from 'react';
import { MapDebugPanel, type DebugInfo } from './MapDebugPanel';
import { readViewport, viewportFromEvent, writeViewport } from './mapViewport';

/**
 * Fallback centre when the browser will not provide a location, or the user denies
 * the prompt. Denver, chosen arbitrarily.
 */
const FALLBACK_CENTER = { lat: 39.7392, lng: -104.9903 };
const FALLBACK_ZOOM = 10;

/** Close enough to a street to be useful, without implying precision. */
const LOCATED_ZOOM = 13;

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type GeoResult = DebugInfo['geolocationResult'];

/** The camera the map opens with, resolved once before the map mounts. */
interface InitialCamera {
  lat: number;
  lng: number;
  zoom: number;
  mapType?: string;
  source: 'saved' | 'geolocation' | 'fallback';
}

export interface MapCanvasProps {
  /** Rendered when the key is absent, instead of attempting to load the SDK. */
  fallback: React.ReactNode;
}

/**
 * Interactive map.
 *
 * The camera is resolved ONCE and handed to the Map as `default*` props. React never
 * mirrors the camera in state, so panning and zooming are owned entirely by the SDK
 * and no effect fights the user.
 *
 * Persistence: a saved viewport wins over geolocation, and every settled camera change
 * is written to sessionStorage, so a hard refresh restores where the user left off.
 */
export function MapCanvas({ fallback }: MapCanvasProps) {
  /**
   * Mount gate.
   *
   * `sessionStorage` and `navigator.geolocation` exist only in the browser. Rendering
   * the map only after mount means the lazy initialisers below never run during server
   * rendering, which is what caused four previous hydration mismatches. Do not replace
   * this with a `typeof window` branch — that is evaluated by the server too.
   */
  const [mounted, setMounted] = useState(false);
  // The canonical browser-only gate. The rule flags synchronous setState in an effect,
  // but this is the documented React pattern for "render this only on the client", and
  // it is what prevents the four earlier hydration mismatches. Narrowly suppressed.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate
  useEffect(() => setMounted(true), []);

  /**
   * Read synchronously during the first client render, which is safe because the gate
   * guarantees this component has not rendered on the server.
   */
  const [saved] = useState(() => (mounted ? readViewport() : null));

  const [camera, setCamera] = useState<InitialCamera | null>(() => {
    if (!mounted) return null;
    if (saved) {
      return {
        lat: saved.lat,
        lng: saved.lng,
        zoom: saved.zoom,
        ...(saved.mapType ? { mapType: saved.mapType } : {}),
        source: 'saved',
      };
    }
    return null;
  });

  const [geoResult, setGeoResult] = useState<GeoResult>(() => {
    if (!mounted) return 'pending';
    return saved ? 'not-requested' : 'pending';
  });
  const [geoSupported] = useState<boolean | null>(() =>
    mounted ? Boolean(window.navigator.geolocation) : null,
  );

  // Geolocation is genuinely asynchronous, so it belongs in an effect. The state
  // updates below happen in the browser callback, not synchronously in the effect body.
  useEffect(() => {
    if (!mounted || saved) return;
    if (!window.navigator.geolocation) return;

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setCamera({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: LOCATED_ZOOM,
          source: 'geolocation',
        });
        setGeoResult('granted');
      },
      (error) => {
        if (cancelled) return;
        setCamera({ ...FALLBACK_CENTER, zoom: FALLBACK_ZOOM, source: 'fallback' });
        // Silent by design; the fallback centre stands.
        setGeoResult(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );

    return () => {
      cancelled = true;
    };
  }, [mounted, saved]);

  /** Records what the user chose. Fires on drag end and zoom end. */
  const handleCameraChanged = useCallback((event: MapCameraChangedEvent) => {
    const viewport = viewportFromEvent(event);
    if (viewport) writeViewport(viewport);
  }, []);

  const info: DebugInfo = {
    keyPresent: Boolean(API_KEY),
    keySuffix: API_KEY ? API_KEY.slice(-6) : '',
    geolocationSupported: geoSupported,
    geolocationResult: geoResult,
    coords: camera?.source === 'geolocation' ? { lat: camera.lat, lng: camera.lng } : null,
    restoredViewport: saved,
    restored: camera?.source === 'saved',
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
      {camera === null ? (
        <div className="flex h-96 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500">
          Resolving viewport…
        </div>
      ) : (
        <div className="h-96 overflow-hidden rounded-lg border border-slate-300">
          <APIProvider apiKey={API_KEY}>
            <Map
              defaultCenter={{ lat: camera.lat, lng: camera.lng }}
              defaultZoom={camera.zoom}
              {...(camera.mapType ? { defaultMapTypeId: camera.mapType as never } : {})}
              gestureHandling="greedy"
              disableDefaultUI={false}
              onCameraChanged={handleCameraChanged}
              style={{ width: '100%', height: '100%' }}
            />
          </APIProvider>
        </div>
      )}
      {/* Outside the overflow-hidden map container, so it is not clipped. */}
      <MapDebugPanel info={info} />
    </div>
  );
}
