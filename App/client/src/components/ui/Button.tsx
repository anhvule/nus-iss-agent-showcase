import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-sky-700 text-white hover:bg-sky-800',
  secondary: 'bg-white text-sky-800 ring-1 ring-inset ring-sky-300 hover:bg-sky-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

/**
 * Button primitive (FR-011). Presentation only — accessible focus ring, keyboard
 * operable by default (native <button>). Variants for common emphasis levels.
 */
export function Button({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}): React.JSX.Element {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold',
        'transition-colors focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-offset-2 focus-visible:outline-sky-600',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
