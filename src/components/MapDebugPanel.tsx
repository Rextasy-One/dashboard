'use client';

import { useApiLoadingStatus } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

export interface DebugInfo {
  /** Whether NEXT_PUBLIC_GOOGLE_MAPS_API_KEY was present at build time. */
  keyPresent: boolean;
  /** Last 6 characters of the key, to confirm which key is loaded. */
  keySuffix: string;
  /** `navigator.geolocation` availability. Null until the browser reports. */
  geolocationSupported: boolean | null;
  /** Outcome of the location request. */
  geolocationResult: 'pending' | 'granted' | 'denied' | 'unavailable' | 'not-requested';
  /** Coordinates, when the request succeeded. */
  coords: { lat: number; lng: number } | null;
  /** Viewport read from sessionStorage, if any. */
  restoredViewport: { lat: number; lng: number; zoom: number; mapType?: string } | null;
  /** True when the camera came from a saved viewport rather than geolocation. */
  restored: boolean;
}

/**
 * Reads the referrer and the live saved viewport from the browser.
 *
 * Both are read in effects, never during render: they do not exist on the server and
 * reading them during render causes a hydration mismatch.
 */
function useBrowserState(): { referrer: string | null; stored: string | null } {
  const [referrer, setReferrer] = useState<string | null>(null);
  const [stored, setStored] = useState<string | null>(null);

  useEffect(() => {
    // Deferred to a microtask so neither value lands in the same commit as hydration.
    queueMicrotask(() => {
      setReferrer(document.referrer || '(none)');
      setStored(window.sessionStorage.getItem('dashboard.map.viewport'));
    });
  }, []);

  return { referrer, stored };
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  const tone = ok === undefined ? 'text-slate-700' : ok ? 'text-emerald-700' : 'text-red-700';

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="w-40 shrink-0 text-slate-500">{label}</span>
      <span className={`font-mono ${tone}`}>{value}</span>
    </div>
  );
}

/**
 * Renders the SDK loading status from inside the APIProvider, where the context is
 * available. Kept separate because the panel itself sits outside the provider.
 */
export function ApiStatus() {
  const status = useApiLoadingStatus();

  const ok = status === 'LOADED';
  const explanation: Record<string, string> = {
    NOT_LOADED: 'The SDK has not started loading yet.',
    LOADING: 'Requesting the Maps JavaScript API.',
    LOADED: 'The SDK loaded and the key was accepted.',
    FAILED: 'The script failed to load. Network or blocked request.',
    AUTH_FAILURE: 'The key was rejected. Check the referrer restriction and API restriction.',
  };

  return (
    <>
      <Row label="SDK status" value={status} ok={ok} />
      <Row label="Meaning" value={explanation[status] ?? 'Unknown status.'} />
    </>
  );
}

/**
 * Debug panel for the Map page.
 *
 * Temporary. It exists to answer "why is the map not showing?" without a round trip
 * through browser devtools. Remove once the map is confirmed working in every
 * environment.
 */
export function MapDebugPanel({ info }: { info: DebugInfo }) {
  const { referrer, stored } = useBrowserState();

  return (
    <details className="rounded-lg border border-slate-300 bg-white" open>
      <summary className="cursor-pointer px-5 py-3 font-medium text-slate-700">Map debug</summary>
      <div className="flex flex-col gap-1 border-t border-slate-200 px-5 py-4 text-sm">
        <Row
          label="API key"
          value={info.keyPresent ? `present, ends …${info.keySuffix}` : 'MISSING'}
          ok={info.keyPresent}
        />
        <Row
          label="Referrer"
          value={referrer ?? '…'}
          ok={referrer === null ? undefined : referrer.startsWith('https://localhost:3000')}
        />
        <Row
          label="Geolocation"
          value={`${
            info.geolocationSupported === null
              ? 'unknown'
              : info.geolocationSupported
                ? 'supported'
                : 'unsupported'
          } — ${info.geolocationResult}`}
          ok={info.geolocationResult === 'granted'}
        />
        {info.coords ? (
          <Row
            label="Coordinates"
            value={`${info.coords.lat.toFixed(5)}, ${info.coords.lng.toFixed(5)}`}
          />
        ) : null}

        <div className="mt-2 border-t border-slate-200 pt-3">
          <p className="mb-1 text-slate-500">Viewport</p>
          <Row
            label="Restored from storage"
            value={info.restored ? 'yes' : 'no'}
            ok={info.restored ? true : undefined}
          />
          {info.restoredViewport ? (
            <Row
              label="Saved value"
              value={`${info.restoredViewport.lat.toFixed(4)}, ${info.restoredViewport.lng.toFixed(4)} @ z${info.restoredViewport.zoom}`}
            />
          ) : null}
          <Row label="sessionStorage now" value={stored ?? '(empty)'} />
        </div>

        <div className="mt-2 border-t border-slate-200 pt-3">
          <p className="mb-1 text-slate-500">SDK</p>
          {info.keyPresent ? (
            <ApiStatus />
          ) : (
            <Row label="SDK status" value="not attempted — no key" />
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          A referrer mismatch and an API restriction both surface as <code>AUTH_FAILURE</code>. The
          Google Cloud console shows the exact reason under Credentials → the key → Metrics.
        </p>
      </div>
    </details>
  );
}
