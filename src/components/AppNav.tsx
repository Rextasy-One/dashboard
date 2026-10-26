'use client';

import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { SiGooglemaps } from 'react-icons/si';

export interface AppNavItem {
  label: string;
  href: string;
  icon: IconType;
}

/**
 * The small applications featured inside the dashboard.
 *
 * Add an entry here and a route under `src/app/<segment>/page.tsx`.
 */
const ITEMS: readonly AppNavItem[] = [{ label: 'Map', href: '/map', icon: SiGooglemaps }];

export interface AppNavProps {
  /**
   * Value of Next's `basePath` for this app, if any. Next strips it from
   * `usePathname()`, so it is put back to compare against public URLs.
   */
  basePath?: string;
}

/**
 * Secondary navigation for the featured applications.
 *
 * Dashboard-local for now. It moves to `@aws-rex/common-components` when a second
 * app needs the same thing.
 */
export function AppNav({ basePath = '' }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Applications" className="border-b border-slate-200 bg-white">
      <ul className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-3">
        {ITEMS.map((item) => {
          const href = `${basePath}${item.href}`;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <a
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'inline-flex items-center gap-2 rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
