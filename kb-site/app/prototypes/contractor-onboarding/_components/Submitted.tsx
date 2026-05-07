'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardGlyph,
  CopyGlyph,
  HandshakeGlyph,
  KeyGlyph,
} from './icons';
import { EASE_OUT } from './types';
import { Card } from './ui';

const TIMELINE = [
  { label: 'Application received', state: 'done' as const },
  { label: 'Internal review', state: 'active' as const },
  { label: 'Lender approval', state: 'pending' as const },
  { label: 'Account activated', state: 'pending' as const },
];

const NEXT_STEPS = [
  {
    glyph: <ClipboardGlyph className="text-brand-accent-dark" />,
    title: 'Internal review',
    body: "We'll review your details and get back if anything's missing — usually within 1 business day.",
  },
  {
    glyph: <HandshakeGlyph className="text-brand-accent-dark" />,
    title: 'Lender approval',
    body: 'Optimus forwards your information to the lender. They run their own merchant approval process.',
  },
  {
    glyph: <KeyGlyph className="text-brand-accent-dark" />,
    title: 'Account activated',
    body: 'Once approved, your account goes live and you can start originating loans.',
  },
];

type Props = {
  email: string;
};

export function Submitted({ email }: Props) {
  const reduce = useReducedMotion();
  const referenceNumber = useMemo(() => {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `OPT-2026-${n}`;
  }, []);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState<'ref' | 'link' | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Anchor "received" timestamp at first render.
  const [start] = useState(() => Date.now());
  const minutesAgo = Math.floor((now - start) / 60_000);
  const justText =
    minutesAgo === 0
      ? 'Just now'
      : minutesAgo === 1
        ? '1 minute ago'
        : `${minutesAgo} minutes ago`;

  const copy = async (text: string, kind: 'ref' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied((c) => (c === kind ? null : c)), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <Card className="relative px-6 md:px-10 py-10 md:py-14 overflow-hidden">
          {/* radial ring expansion on first paint */}
          {!reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[88px] -translate-x-1/2"
            >
              <div className="w-24 h-24 rounded-full border-2 border-brand-accent animate-ring-expand" />
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="relative w-20 h-20 rounded-full bg-brand-accent-soft flex items-center justify-center"
            >
              <DrawingCheck />
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
              className="mt-6 font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-brand-ink"
            >
              Application submitted.
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-2 text-brand-muted"
            >
              We'll be in touch within 2 business days.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-5 flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => copy(referenceNumber, 'ref')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-brand-canvas text-xs font-tabular tabular-nums text-brand-ink hover:border-brand-accent transition-colors"
              >
                <span className="text-brand-muted">Reference</span>
                <span>{referenceNumber}</span>
                <CopyGlyph className="text-brand-muted" />
              </button>
              {copied === 'ref' && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-brand-accent-dark"
                >
                  Copied
                </motion.span>
              )}
            </motion.div>

            <div className="mt-10 w-full">
              <div className="flex items-center gap-3 mb-4 text-[11px] tracking-[0.16em] uppercase font-tabular text-brand-muted">
                <span className="flex-1 h-px bg-brand-border" />
                <span>Activity</span>
                <span className="flex-1 h-px bg-brand-border" />
              </div>
              <ul className="space-y-3 text-left">
                {TIMELINE.map((t, i) => (
                  <motion.li
                    key={t.label}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.12, duration: 0.45 }}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`relative w-3 h-3 rounded-full border-2 ${
                        t.state === 'done'
                          ? 'bg-brand-accent-dark border-brand-accent-dark'
                          : t.state === 'active'
                            ? 'bg-brand-canvas border-brand-accent-dark'
                            : 'bg-brand-canvas border-stone-300'
                      }`}
                    >
                      {t.state === 'active' && (
                        <span className="absolute inset-0 rounded-full bg-brand-accent-dark/30 animate-ping" />
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        t.state === 'pending'
                          ? 'text-brand-muted'
                          : 'text-brand-ink'
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="flex-1" />
                    {t.state === 'done' && (
                      <span className="text-xs text-brand-muted font-tabular tabular-nums">
                        {justText}
                      </span>
                    )}
                    {t.state === 'active' && (
                      <span className="text-xs text-brand-accent-dark inline-flex gap-0.5">
                        <Dot delay={0} />
                        <Dot delay={150} />
                        <Dot delay={300} />
                      </span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-6 border-t border-brand-border w-full">
              <Image
                src="/brand/optimus-logo.png"
                alt="Optimus"
                width={180}
                height={42}
                className="mx-auto h-auto w-[150px] opacity-90"
              />
            </div>
          </div>
        </Card>

        <div className="mt-10">
          <h2 className="text-xs uppercase tracking-[0.16em] font-tabular text-brand-muted mb-4">
            What happens next
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NEXT_STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1, duration: 0.5 }}
              >
                <Card className="p-5 h-full">
                  <div className="w-9 h-9 rounded-lg bg-brand-accent-soft flex items-center justify-center mb-4">
                    {s.glyph}
                  </div>
                  <div className="text-sm font-medium text-brand-ink">
                    {s.title}
                  </div>
                  <div className="mt-1.5 text-xs text-brand-muted leading-relaxed">
                    {s.body}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 px-1 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                copy(window.location.href, 'link');
              }
            }}
            className="inline-flex items-center gap-2 text-xs text-brand-muted hover:text-brand-ink transition-colors"
          >
            <CopyGlyph />
            <span>Copy this page link</span>
            {copied === 'link' && (
              <span className="text-brand-accent-dark">— Link copied</span>
            )}
          </button>
          <p className="text-[11px] text-brand-muted/70 font-tabular tracking-wide">
            UI prototype — final feature set to be confirmed.
          </p>
        </div>

        {email && (
          <p className="mt-6 text-center text-[11px] text-brand-muted">
            Confirmation also goes to <span className="text-brand-ink">{email}</span>.
          </p>
        )}
      </div>
    </main>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block w-1 h-1 rounded-full bg-brand-accent-dark animate-bounce"
      style={{ animationDelay: `${delay}ms`, animationDuration: '1.2s' }}
    />
  );
}

function DrawingCheck() {
  return (
    <svg
      viewBox="0 0 56 56"
      width="44"
      height="44"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand-accent-dark"
      aria-hidden
    >
      <path
        d="M14 28.5l9 9 19-19"
        strokeDasharray="60"
        strokeDashoffset="60"
        className="animate-check-draw"
      />
    </svg>
  );
}
