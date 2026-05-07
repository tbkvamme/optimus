'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { ArrowRight, ChevronDown, GaugeDot, Spinner } from './icons';

export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const fontSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  return (
    <span className={`inline-flex items-baseline gap-1 font-display font-semibold tracking-tight ${fontSize}`}>
      <span className="text-brand-ink">Optimus</span>
      <GaugeDot className="-translate-y-[3px]" />
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  loading?: boolean;
  trailing?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, trailing, children, className = '', disabled, ...rest },
  ref,
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-display font-medium tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-canvas disabled:cursor-not-allowed';
  const sizes = {
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-12 px-6 text-base rounded-xl',
  };
  const variants = {
    primary:
      'bg-brand-ink text-brand-canvas hover:bg-brand-accent-dark hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_rgb(15_118_110_/_0.55)] disabled:bg-stone-300 disabled:text-stone-500 disabled:hover:translate-y-0 disabled:hover:shadow-none',
    secondary:
      'bg-brand-surface text-brand-ink border border-brand-border hover:border-brand-ink hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0',
    ghost:
      'text-brand-muted hover:text-brand-ink hover:bg-stone-100/60 disabled:opacity-50',
  };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      <span>{children}</span>
      {!loading && trailing ? <span className="-mr-0.5">{trailing}</span> : null}
    </button>
  );
});

export function PrimaryCTA({ children, ...rest }: ButtonProps) {
  return (
    <Button variant="primary" size="lg" trailing={<ArrowRight />} {...rest}>
      {children}
    </Button>
  );
}

export function Pill({
  children,
  tone = 'neutral',
  numbered,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'soft';
  numbered?: number;
}) {
  const tones = {
    neutral: 'bg-brand-surface text-brand-ink border border-brand-border',
    accent: 'bg-brand-accent-soft text-brand-accent-dark border border-brand-accent/30',
    soft: 'bg-stone-100 text-brand-muted border border-stone-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${tones[tone]}`}
    >
      {numbered != null && (
        <span className="font-tabular text-[10px] tabular-nums opacity-60">
          {String(numbered).padStart(2, '0')}
        </span>
      )}
      {children}
    </span>
  );
}

export function Field({
  label,
  optional,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-1.5 text-xs font-medium text-brand-ink mb-1.5">
        <span>{label}</span>
        {optional && <span className="text-brand-muted font-normal">(optional)</span>}
      </span>
      {children}
      {error ? (
        <span className="block mt-1 text-xs text-brand-danger">{error}</span>
      ) : hint ? (
        <span className="block mt-1 text-xs text-brand-muted">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  'block w-full h-10 px-3 rounded-lg bg-brand-surface border border-brand-border text-sm text-brand-ink placeholder:text-stone-400 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 transition-colors';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className = '', ...rest }, ref) {
    return <input ref={ref} className={`${inputBase} ${className}`} {...rest} />;
  },
);

export function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={`${inputBase} appearance-none pr-9 ${className}`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 mt-[2px] w-9 h-5 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-canvas ${
          checked ? 'bg-brand-accent-dark' : 'bg-stone-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      <span className="text-sm">
        <span className="block text-brand-ink">{label}</span>
        {hint && <span className="block text-xs text-brand-muted mt-0.5">{hint}</span>}
      </span>
    </label>
  );
}

export function SectionHeading({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <span className="font-tabular text-xs tabular-nums text-brand-muted">
        {String(number).padStart(2, '0')}
      </span>
      <h2 className="font-display text-lg font-medium tracking-tight text-brand-ink">
        {children}
      </h2>
      <span className="flex-1 h-px bg-brand-border" />
    </div>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-0 h-px bg-brand-border ${className}`} />;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-brand-surface border border-brand-border rounded-2xl shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_24px_-12px_rgb(15_23_42_/_0.08)] ${className}`}
    >
      {children}
    </div>
  );
}
