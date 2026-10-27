'use client';

import type { MapCameraChangedEvent } from '@vis.gl/react-google-maps';

/**
 * Persisted map viewport.
 *
 * `sessionStorage`, so it survives a hard refresh and disappears when the tab
 * closes. Two tabs keep independent viewports.
 */
export interface MapViewport {
  lat: number;
  lng: number;
  zoom: number;
  mapType?: string;
}

const STORAGE_KEY = 'dashboard.map.viewport';

/** Rejects anything that would produce a broken map on restore. */
function isValid(value: unknown): value is MapViewport {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<MapViewport>;
  return (
    typeof v.lat === 'number' &&
    Number.isFinite(v.lat) &&
    v.lat >= -90 &&
    v.lat <= 90 &&
    typeof v.lng === 'number' &&
    Number.isFinite(v.lng) &&
    v.lng >= -180 &&
    v.lng <= 180 &&
    typeof v.zoom === 'number' &&
    Number.isFinite(v.zoom) &&
    v.zoom >= 0 &&
    v.zoom <= 22
  );
}

/**
 * Reads the saved viewport.
 *
 * Always runs in an effect, never during render: `sessionStorage` does not exist on
 * the server, and reading it during render causes a hydration mismatch.
 */
export function readViewport(): MapViewport | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    // Private mode, quota, or malformed JSON. Treat as absent.
    return null;
  }
}

export function writeViewport(viewport: MapViewport): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(viewport));
  } catch {
    // Losing a saved viewport must never break the page.
  }
}

export function clearViewport(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

/** Extracts the viewport from a camera event. */
export function viewportFromEvent(event: MapCameraChangedEvent): MapViewport | null {
  const center = event.detail.center;
  const zoom = event.detail.zoom;

  if (center === undefined || zoom === undefined) return null;

  // The camera reports an empty center before the map has settled.
  if (typeof center.lat !== 'number' || typeof center.lng !== 'number') return null;
  if (!Number.isFinite(zoom)) return null;

  return { lat: center.lat, lng: center.lng, zoom };
}
