'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/cn';

/**
 * Primary navigation (FR-009, FR-010).
 *
 * Renders the top-level sections as client-side links (no full reload) and marks
 * the current section with `aria-current="page"` for accessibility (FR-013).
 * The active section is derived from the pathname: exact match for Home, prefix
 * match for the other sections so nested routes stay highlighted.
 */
export function Navigation(): React.JSX.Element {
  const pathname = usePathname();

  const isActive = (href: string): boolean =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-x-1 gap-y-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
              active
                ? 'bg-sky-100 text-sky-900'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
