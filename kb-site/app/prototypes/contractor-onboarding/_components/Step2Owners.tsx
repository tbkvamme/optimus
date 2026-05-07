'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { CheckGlyph, PlusGlyph } from './icons';
import { StepShell } from './StepShell';
import { EASE_OUT, newOwner, type Owner } from './types';
import { Field, Select, TextInput } from './ui';

const MAX_OWNERS = 4;

const months = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
];

type Props = {
  owners: Owner[];
  onChange: (next: Owner[]) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function Step2Owners({ owners, onChange, onContinue, onBack }: Props) {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(
    owners[0]?.id ?? null,
  );
  const [pulse, setPulse] = useState(false);

  const total = owners.reduce((s, o) => s + (o.ownership || 0), 0);
  const exact = total === 100;

  // Trigger one-shot pulse the moment we land on 100.
  const [prevExact, setPrevExact] = useState(false);
  useEffect(() => {
    if (exact && !prevExact) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1300);
      return () => clearTimeout(t);
    }
    setPrevExact(exact);
  }, [exact, prevExact]);

  const ownersComplete = owners.every(
    (o) =>
      o.firstName.trim() &&
      o.lastName.trim() &&
      o.ownership > 0 &&
      o.email.trim(),
  );

  const canContinue = owners.length > 0 && exact && ownersComplete;

  const update = (id: string, patch: Partial<Owner>) =>
    onChange(owners.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const remove = (id: string) =>
    onChange(owners.filter((o) => o.id !== id));

  const remaining = Math.max(0, 100 - total);

  const add = (suggested?: number) => {
    if (owners.length >= MAX_OWNERS) return;
    const o = newOwner({ ownership: suggested ?? 0 });
    onChange([...owners, o]);
    setActiveId(o.id);
  };

  const stateLabel = useMemo<{ tone: 'good' | 'bad' | 'mute'; text: string }>(() => {
    if (exact) return { tone: 'good', text: 'Ready to continue' };
    if (total > 100) return { tone: 'bad', text: `Reduce by ${total - 100}%` };
    if (total === 0) return { tone: 'mute', text: 'Add an owner to begin' };
    return { tone: 'mute', text: `Add ${remaining}% more to continue` };
  }, [exact, total, remaining]);

  return (
    <StepShell
      step={2}
      title="Beneficial owners"
      helper="Add the people who own 25% or more of the business. Ownership must total exactly 100%."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!canContinue}
    >
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {owners.map((owner, i) => (
            <motion.div
              key={owner.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              <OwnerCard
                index={i}
                total={owners.length}
                owner={owner}
                active={activeId === owner.id}
                onActivate={() => setActiveId(owner.id)}
                onChange={(patch) => update(owner.id, patch)}
                onRemove={() => {
                  remove(owner.id);
                  if (activeId === owner.id) setActiveId(null);
                }}
                remainingForThis={
                  100 - (total - (owner.ownership || 0))
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {owners.length < MAX_OWNERS && (
          <button
            type="button"
            onClick={() => add(remaining > 0 ? remaining : undefined)}
            className="group w-full text-left rounded-2xl border border-dashed border-brand-border bg-brand-surface/40 hover:bg-brand-surface hover:border-brand-accent transition-colors px-5 py-4 flex items-center gap-3 text-sm"
          >
            <span className="w-8 h-8 rounded-full bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-muted group-hover:text-brand-accent-dark transition-colors">
              <PlusGlyph />
            </span>
            <span className="flex-1">
              <span className="block text-brand-ink font-medium">Add another owner</span>
              {remaining > 0 && remaining < 100 && (
                <span className="block text-xs text-brand-muted mt-0.5 font-tabular tabular-nums">
                  Suggest: {remaining}% remaining
                </span>
              )}
            </span>
            {owners.length === 0 && (
              <span className="text-xs text-brand-muted hidden md:block">
                Owner 1 of up to 4
              </span>
            )}
          </button>
        )}

        {owners.length === MAX_OWNERS && (
          <p className="text-xs text-brand-muted px-1">
            Maximum of {MAX_OWNERS} owners in this prototype.
          </p>
        )}
      </div>

      <StickyTotal
        total={total}
        state={stateLabel}
        pulse={pulse}
        canContinue={canContinue}
      />
    </StepShell>
  );
}

function StickyTotal({
  total,
  state,
  pulse,
  canContinue,
}: {
  total: number;
  state: { tone: 'good' | 'bad' | 'mute'; text: string };
  pulse: boolean;
  canContinue: boolean;
}) {
  const fill = Math.min(100, total) / 100;
  const over = total > 100;
  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-40 px-4 pb-4 pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 1rem)' }}
    >
      <div
        className={`pointer-events-auto mx-auto max-w-3xl rounded-2xl border bg-brand-surface/95 backdrop-blur shadow-[0_12px_30px_-12px_rgb(15_23_42_/_0.18)] transition-colors ${
          pulse ? 'animate-pulse-once' : ''
        } ${over ? 'border-brand-danger/40' : 'border-brand-border'}`}
      >
        <div className="px-4 pt-3 pb-3.5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.16em] font-tabular text-brand-muted">
              Ownership
            </span>
            <span
              className={`font-tabular tabular-nums text-sm ${
                over ? 'text-brand-danger' : 'text-brand-ink'
              }`}
            >
              <span className="text-base font-medium">{total}</span>
              <span className="text-brand-muted"> / 100%</span>
            </span>
            <span className="flex-1" />
            <span
              className={`flex items-center gap-1.5 text-xs ${
                state.tone === 'good'
                  ? 'text-brand-accent-dark'
                  : state.tone === 'bad'
                    ? 'text-brand-danger'
                    : 'text-brand-muted'
              }`}
            >
              {state.tone === 'good' && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-accent-soft text-brand-accent-dark">
                  <CheckGlyph />
                </span>
              )}
              <span>{state.text}</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <motion.div
              animate={{ width: `${fill * 100}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              className={`h-full rounded-full ${
                over ? 'bg-brand-danger' : canContinue ? 'bg-brand-accent-dark' : 'bg-brand-accent/60'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerCard({
  index,
  total,
  owner,
  active,
  onActivate,
  onChange,
  onRemove,
  remainingForThis,
}: {
  index: number;
  total: number;
  owner: Owner;
  active: boolean;
  onActivate: () => void;
  onChange: (patch: Partial<Owner>) => void;
  onRemove: () => void;
  remainingForThis: number;
}) {
  const display =
    [owner.firstName, owner.lastName].filter(Boolean).join(' ') ||
    'Unnamed owner';

  if (!active) {
    return (
      <button
        type="button"
        onClick={onActivate}
        className="w-full text-left rounded-2xl border border-brand-border bg-brand-surface px-5 py-4 hover:border-brand-ink/40 transition-colors flex items-center gap-4"
      >
        <span className="w-8 h-8 rounded-full bg-brand-canvas border border-brand-border flex items-center justify-center text-[11px] font-tabular tabular-nums text-brand-muted">
          {index + 1}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-brand-ink truncate">
            {display}
          </span>
          <span className="block text-xs text-brand-muted truncate">
            {owner.title || 'No title'}
          </span>
        </span>
        <span className="font-tabular tabular-nums text-sm text-brand-ink">
          {owner.ownership}%
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-ink/30 bg-brand-surface px-5 pt-4 pb-5 shadow-[0_2px_4px_rgb(15_23_42_/_0.04),0_18px_30px_-18px_rgb(15_23_42_/_0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-brand-ink text-brand-canvas flex items-center justify-center text-[11px] font-tabular tabular-nums">
          {index + 1}
        </span>
        <span className="text-xs uppercase tracking-[0.16em] font-tabular text-brand-muted">
          Owner {index + 1} of {total}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-brand-muted hover:text-brand-danger transition-colors"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <Field label="First name">
          <TextInput
            autoComplete="given-name"
            value={owner.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
          />
        </Field>
        <Field label="Last name">
          <TextInput
            autoComplete="family-name"
            value={owner.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
          />
        </Field>
        <Field label="Title" optional>
          <TextInput
            value={owner.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Owner, President…"
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            value={owner.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field label="Phone" optional>
          <TextInput
            type="tel"
            inputMode="tel"
            value={owner.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </Field>
        <Field label="Date of birth">
          <div className="flex items-center gap-2">
            <Select
              value={owner.dobMonth}
              onChange={(e) => onChange({ dobMonth: e.target.value })}
              className="font-tabular tabular-nums"
            >
              <option value="">MM</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <TextInput
              inputMode="numeric"
              maxLength={2}
              placeholder="DD"
              className="font-tabular tabular-nums text-center"
              value={owner.dobDay}
              onChange={(e) =>
                onChange({ dobDay: e.target.value.replace(/\D/g, '').slice(0, 2) })
              }
            />
            <TextInput
              inputMode="numeric"
              maxLength={4}
              placeholder="YYYY"
              className="font-tabular tabular-nums text-center"
              value={owner.dobYear}
              onChange={(e) =>
                onChange({ dobYear: e.target.value.replace(/\D/g, '').slice(0, 4) })
              }
            />
          </div>
        </Field>
      </div>

      <div className="mt-6 pt-5 border-t border-brand-border">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="text-xs font-medium text-brand-ink">Ownership</span>
          <span className="text-xs text-brand-muted">
            Hold <kbd className="font-tabular px-1 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px]">Shift</kbd> for fine-grained
          </span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={owner.ownership}
            onChange={(e) => {
              let v = Number(e.target.value);
              const shift = (e.nativeEvent as unknown as { shiftKey?: boolean }).shiftKey;
              if (!shift) v = Math.round(v / 25) * 25;
              onChange({ ownership: v });
            }}
            className="flex-1 h-1.5 accent-brand-accent-dark"
          />
          <span className="font-tabular tabular-nums text-2xl font-medium text-brand-ink w-20 text-right">
            {owner.ownership}<span className="text-brand-muted text-base">%</span>
          </span>
        </div>
        {remainingForThis !== owner.ownership && remainingForThis >= 0 && remainingForThis !== 100 && (
          <button
            type="button"
            onClick={() => onChange({ ownership: remainingForThis })}
            className="mt-2 text-xs text-brand-accent-dark hover:text-brand-ink transition-colors"
          >
            Set to {remainingForThis}% (remaining)
          </button>
        )}
      </div>
    </div>
  );
}
