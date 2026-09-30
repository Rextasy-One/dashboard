export const metadata = {
  title: 'Dashboard | Rex Staples',
};

/**
 * The dashboard application, served at `/dashboard`.
 */
export default function DashboardPage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Hello World</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">This is the dashboard.</h1>
      <p className="max-w-2xl text-lg text-slate-600">
        Served at <code className="rounded bg-slate-200 px-1.5 py-0.5">/dashboard</code>. The header
        and footer are rendered from the shared{' '}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 text-base">
          @aws-rex/common-components
        </code>{' '}
        package.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          href="https://nextjs.org"
        >
          Next.js docs
        </a>
        <a
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          href="https://tailwindcss.com"
        >
          Tailwind docs
        </a>
      </div>
    </section>
  );
}
