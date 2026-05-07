'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { EASE_OUT } from './types';
import { PrimaryCTA, Pill } from './ui';

const PILL_TIPS: Record<string, string> = {
  'Tax ID': 'Your business EIN (US) or BN (Canada). Required for lender KYB.',
  'Bank account': 'Where loan funding will be deposited. Routing and account numbers, plus a voided cheque.',
  'Beneficial-owner info': 'Names, ownership percentages, and basic identity details for owners of 25% or more.',
};

type Props = {
  onBegin: () => void;
  onSkipToDemo: () => void;
};

export function Welcome({ onBegin, onSkipToDemo }: Props) {
  const reduce = useReducedMotion();
  const [activeTip, setActiveTip] = useState<string | null>(null);

  const stagger = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay: 0.08 + i * 0.09, ease: EASE_OUT },
  });

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 30%, rgba(45, 212, 191, 0.10) 0%, rgba(250, 250, 247, 0) 60%), radial-gradient(40% 35% at 85% 80%, rgba(15, 118, 110, 0.06) 0%, rgba(250, 250, 247, 0) 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-12 md:pt-24 md:pb-20 flex flex-col min-h-screen">
        <motion.div {...stagger(0)} className="flex flex-col items-center">
          <Image
            src="/brand/optimus-logo.png"
            alt="Optimus"
            width={280}
            height={66}
            priority
            className="h-auto w-[200px] md:w-[260px]"
          />
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center text-center mt-12 md:mt-16">
          <motion.div {...stagger(1)} className="mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase font-tabular text-brand-accent-dark bg-brand-accent-soft border border-brand-accent/30">
              Partner enrollment
            </span>
          </motion.div>

          <motion.h1
            {...stagger(2)}
            className="font-display text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-brand-ink leading-[1.05]"
          >
            Become a partner.
          </motion.h1>

          <motion.p
            {...stagger(3)}
            className="mt-5 text-base md:text-lg text-brand-muted max-w-md"
          >
            Apply to originate Optimus loans for your customers. Approvals quickly, paperwork minimally.
          </motion.p>

          <motion.div
            {...stagger(4)}
            className="mt-3 text-xs text-brand-muted/80 font-tabular tabular-nums"
          >
            About 12 minutes <span className="mx-2 opacity-50">·</span> You can return to this page later
          </motion.div>

          <motion.div {...stagger(5)} className="mt-8 flex flex-wrap justify-center gap-2 relative">
            {Object.keys(PILL_TIPS).map((label, i) => (
              <span
                key={label}
                onMouseEnter={() => setActiveTip(label)}
                onMouseLeave={() => setActiveTip(null)}
                onFocus={() => setActiveTip(label)}
                onBlur={() => setActiveTip(null)}
                tabIndex={0}
                className="relative cursor-help"
              >
                <Pill tone="neutral" numbered={i + 1}>
                  {label}
                </Pill>
                {activeTip === label && (
                  <span className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-2 w-64 px-3 py-2 rounded-lg bg-brand-ink text-brand-canvas/90 text-xs leading-snug shadow-lg pointer-events-none">
                    {PILL_TIPS[label]}
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-ink rotate-45" />
                  </span>
                )}
              </span>
            ))}
          </motion.div>

          <motion.div {...stagger(6)} className="mt-10 flex flex-col items-center gap-3">
            <PrimaryCTA onClick={onBegin}>Begin enrollment</PrimaryCTA>
            <button
              type="button"
              onClick={onSkipToDemo}
              title="Prototype-only shortcut for demo purposes."
              className="text-xs text-brand-muted hover:text-brand-ink underline-offset-4 hover:underline transition-colors"
            >
              Skip to ownership demo →
            </button>
          </motion.div>
        </div>

        <motion.div
          {...stagger(7)}
          className="mt-16 pt-6 border-t border-brand-border/60 flex flex-col items-center gap-2 text-center"
        >
          <p className="text-[11px] text-brand-muted">
            Your data is encrypted and never shared without consent.
          </p>
          <p className="text-[10px] text-brand-muted/60 tracking-wide">
            UI prototype — final feature set to be confirmed.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
