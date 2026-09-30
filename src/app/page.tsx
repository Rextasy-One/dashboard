import { BRAND } from '@aws-rex/common-components';

/**
 * Placeholder splash shown at the dashboard's bare URL (`/`).
 *
 * Real content lives at `/dashboard`; this root route exists so hitting the
 * origin directly is not a 404. It is intentionally empty of application UI.
 */
export default function DashboardSplashPage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{BRAND}</h1>
      <p className="max-w-xl text-lg text-slate-500">
        Splash placeholder. Navigate to{' '}
        <code className="rounded bg-slate-200 px-1.5 py-0.5">/dashboard</code> for the application.
      </p>
    </section>
  );
}
