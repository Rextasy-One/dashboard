import { BRAND } from '@aws-rex/common-components';

/**
 * Splash shown at this app's root route.
 *
 * Standalone (no `basePath`) this is `/`. Behind the marketing site the dashboard
 * is served at basePath `/dashboard`, which puts this page at `/dashboard` and the
 * real application at `/dashboard/dashboard` — see `next.config.ts`.
 */
export default function DashboardSplashPage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{BRAND}</h1>
      <p className="max-w-xl text-lg text-slate-500">
        Splash placeholder. Navigate to{' '}
        <code className="rounded bg-slate-200 px-1.5 py-0.5">/dashboard/dashboard</code> for the
        application.
      </p>
    </section>
  );
}
