'use client';

import { useState } from 'react';

export function PrototypeBadge() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="fixed right-3 bottom-3 z-50 select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="relative">
        {open && (
          <div
            className="absolute bottom-full mb-2 right-0 w-64 text-xs leading-snug bg-brand-ink text-brand-canvas/90 rounded-lg px-3 py-2 shadow-lg"
            role="tooltip"
          >
            UI demonstration. Features shown are illustrative; the production feature set is being defined during planning.
            <span className="absolute top-full right-3 w-2 h-2 bg-brand-ink rotate-45 -translate-y-1" />
          </div>
        )}
        <button
          type="button"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-surface/95 backdrop-blur border border-brand-border shadow-sm text-[10px] font-medium tracking-[0.12em] uppercase font-tabular text-brand-accent-dark hover:border-brand-accent transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
          Prototype
        </button>
      </div>
    </div>
  );
}
