'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from './icons';
import { BrandMark, Button } from './ui';

type Props = {
  step: 1 | 2 | 3;
  title: string;
  helper?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  footerStatus?: ReactNode;
};

const STEPS = [
  { n: 1, label: 'Business' },
  { n: 2, label: 'Owners' },
  { n: 3, label: 'Banking' },
  { n: 4, label: 'Submit' },
] as const;

export function StepShell({
  step,
  title,
  helper,
  children,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled,
  continueLoading,
  footerStatus,
}: Props) {
  return (
    <main className="min-h-screen w-full">
      <header className="border-b border-brand-border/70 bg-brand-canvas/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <BrandMark size="sm" />
          <Link
            href="/prototypes"
            className="text-xs text-brand-muted hover:text-brand-ink transition-colors"
          >
            Save & exit
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-5 pb-4">
          <ol className="flex items-center gap-2 text-[10px] tracking-[0.16em] uppercase font-tabular tabular-nums">
            {STEPS.map(({ n, label }) => {
              const state =
                n === step ? 'active' : n < step ? 'done' : 'pending';
              return (
                <li key={n} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                      state === 'active'
                        ? 'bg-brand-ink text-brand-canvas'
                        : state === 'done'
                          ? 'text-brand-accent-dark'
                          : 'text-brand-muted/70'
                    }`}
                  >
                    <span>{String(n).padStart(2, '0')}</span>
                    <span className="hidden sm:inline normal-case tracking-normal text-[11px] font-medium">
                      {label}
                    </span>
                  </span>
                  {n < STEPS.length && (
                    <span className="w-3 sm:w-6 h-px bg-brand-border" aria-hidden />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pt-10 md:pt-14 pb-32 md:pb-40">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-brand-ink">
          {title}
        </h1>
        {helper && (
          <p className="mt-3 text-sm md:text-base text-brand-muted max-w-prose">
            {helper}
          </p>
        )}
        <div className="mt-10">{children}</div>

        <div className="mt-12 pt-6 border-t border-brand-border/70 flex items-center justify-between gap-4">
          <div>
            {onBack && (
              <Button variant="ghost" size="md" onClick={onBack}>
                <ArrowLeft className="mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {footerStatus && (
              <span className="text-xs text-brand-muted hidden md:block">
                {footerStatus}
              </span>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={onContinue}
              disabled={continueDisabled}
              loading={continueLoading}
              trailing={<ArrowRight />}
            >
              {continueLabel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
