'use client';

import { Header, type HeaderProps } from '@aws-rex/common-components';
import { usePathname } from 'next/navigation';

export interface NavigationProps extends Omit<HeaderProps, 'activeHref'> {
  /**
   * Value of Next's `basePath` for this app, if any.
   *
   * Next **strips** basePath from `usePathname()`, so an app mounted under
   * `/dashboard` sees `"/"`. Nav items are expressed in public URLs, so the
   * prefix has to be put back before matching.
   */
  basePath?: string;
}

/**
 * Client wrapper that supplies the active route to the framework-agnostic
 * `Header`. Kept client-side because `usePathname` requires it.
 */
export function Navigation({ basePath = '', ...headerProps }: NavigationProps) {
  const pathname = usePathname();
  const activeHref = basePath ? `${basePath}${pathname === '/' ? '' : pathname}` : pathname;

  return <Header {...headerProps} activeHref={activeHref || '/'} />;
}
