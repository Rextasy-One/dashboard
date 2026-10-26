import { MapCanvas } from '@/components/MapCanvas';

export const metadata = {
  title: 'Map | Rex Staples',
};

/**
 * Shown when no key is present, so the page reports the missing configuration
 * instead of failing silently — the same approach the login page uses for
 * unconfigured providers.
 */
function NotConfigured() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-6">
      <p className="font-medium text-slate-700">Not configured</p>
      <p className="text-sm text-slate-600">
        Set{' '}
        <code className="rounded bg-slate-200 px-1.5 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{' '}
        to enable the map.
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-slate-600">
        <li>Enable the Maps JavaScript API on a Google Cloud project.</li>
        <li>A billing account must be attached, even to stay inside the free tier.</li>
        <li>Restrict the key by HTTP referrer before using it anywhere public.</li>
        <li>Free allowance is 10,000 map loads per month, then roughly $7 per 1,000.</li>
      </ul>
    </div>
  );
}

export default function MapPage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Application</p>
        <h1 className="text-3xl font-semibold tracking-tight">Map</h1>
      </header>

      <MapCanvas fallback={<NotConfigured />} />
    </section>
  );
}
