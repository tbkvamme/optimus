'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChequeIllustration, LockGlyph } from './icons';
import { StepShell } from './StepShell';
import type { BankingState, ConsentState } from './types';
import { Field, SectionHeading, Select, TextInput } from './ui';

const ROUTING_LOOKUP: Record<string, string> = {
  '121000248': 'Wells Fargo',
  '026009593': 'Bank of America',
  '021000089': 'Citibank',
  '091000019': 'U.S. Bank',
  '011401533': 'TD Bank',
  '031176110': 'Capital One',
  '063100277': 'Bank of America (FL)',
  '267084131': 'Navy Federal Credit Union',
  '124003116': 'Zions Bank',
  '021200339': 'Valley National',
};

type Props = {
  banking: BankingState;
  consent: ConsentState;
  onChangeBanking: (next: BankingState) => void;
  onChangeConsent: (next: ConsentState) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  signerNamePrefill: string;
};

export function Step3Banking({
  banking,
  consent,
  onChangeBanking,
  onChangeConsent,
  onBack,
  onSubmit,
  submitting,
  signerNamePrefill,
}: Props) {
  const reduce = useReducedMotion();
  const [acctFocused, setAcctFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const setBanking = <K extends keyof BankingState>(key: K, value: BankingState[K]) =>
    onChangeBanking({ ...banking, [key]: value });
  const setConsent = <K extends keyof ConsentState>(key: K, value: ConsentState[K]) =>
    onChangeConsent({ ...consent, [key]: value });

  const routingDigits = banking.routing.replace(/\D/g, '');
  const routingComplete = routingDigits.length === 9;
  const routingBank = routingComplete ? ROUTING_LOOKUP[routingDigits] : undefined;

  const maskedAccount = banking.accountNumber
    ? '•'.repeat(Math.max(0, banking.accountNumber.length - 4)) +
      banking.accountNumber.slice(-4)
    : '';

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    setBanking('chequeFile', { name: file.name, size: file.size });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) {
      setScrollProgress(1);
      setConsent('scrolled', true);
      return;
    }
    const p = Math.min(1, Math.max(0, el.scrollTop / max));
    setScrollProgress(p);
    if (p >= 0.98) setConsent('scrolled', true);
  };

  const canSubmit =
    banking.accountHolder.trim() &&
    banking.routing.replace(/\D/g, '').length === 9 &&
    banking.accountNumber.trim().length >= 4 &&
    banking.chequeFile &&
    consent.agreed &&
    consent.signatureName.trim();

  return (
    <StepShell
      step={3}
      title="Banking & authorization"
      helper="Where to deposit funding, plus the consent we need to verify your business."
      onBack={onBack}
      onContinue={onSubmit}
      continueLabel={submitting ? 'Submitting' : 'Submit application'}
      continueDisabled={!canSubmit || submitting}
      continueLoading={submitting}
      footerStatus={
        canSubmit ? null : <span>Complete all fields to submit</span>
      }
    >
      <div className="space-y-12 pb-6">
        <section>
          <div className="flex items-center justify-between mb-5">
            <SectionHeading number={1}>Banking</SectionHeading>
          </div>
          <div className="-mt-3 mb-5 flex items-center gap-2 text-xs text-brand-muted">
            <LockGlyph className="text-brand-accent-dark" />
            <span>We use bank-grade encryption. Numbers are masked when not focused.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            <Field label="Account holder name">
              <TextInput
                autoComplete="cc-name"
                value={banking.accountHolder}
                onChange={(e) => setBanking('accountHolder', e.target.value)}
              />
            </Field>
            <Field label="Account type">
              <Select
                value={banking.accountType}
                onChange={(e) =>
                  setBanking('accountType', e.target.value as 'checking' | 'savings')
                }
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </Select>
            </Field>
            <Field
              label="Routing number"
              hint={
                routingBank
                  ? `Bank: ${routingBank}  ·  Demo lookup — verification behaviour TBD.`
                  : routingComplete
                    ? "We'll verify on submit  ·  Demo lookup — verification behaviour TBD."
                    : '9 digits'
              }
            >
              <TextInput
                inputMode="numeric"
                maxLength={9}
                placeholder="121000248"
                className="font-tabular tabular-nums tracking-wide"
                value={banking.routing}
                onChange={(e) =>
                  setBanking('routing', e.target.value.replace(/\D/g, '').slice(0, 9))
                }
              />
            </Field>
            <Field label="Account number">
              <TextInput
                inputMode="numeric"
                placeholder="••••••••"
                className="font-tabular tabular-nums tracking-wide"
                value={acctFocused ? banking.accountNumber : maskedAccount}
                onFocus={() => setAcctFocused(true)}
                onBlur={() => setAcctFocused(false)}
                onChange={(e) =>
                  setBanking('accountNumber', e.target.value.replace(/\D/g, ''))
                }
              />
            </Field>
          </div>

          <div className="mt-6">
            <span className="block text-xs font-medium text-brand-ink mb-2">
              Voided cheque
            </span>
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-colors px-5 py-6 ${
                dragging
                  ? 'border-brand-accent bg-brand-accent-soft/40'
                  : 'border-brand-border bg-brand-surface'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {banking.chequeFile ? (
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-brand-accent-soft text-brand-accent-dark flex items-center justify-center font-tabular text-xs">
                    PNG
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-brand-ink truncate">
                      {banking.chequeFile.name}
                    </div>
                    <div className="text-xs text-brand-muted font-tabular tabular-nums">
                      {(banking.chequeFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-xs text-brand-accent-dark hover:text-brand-ink transition-colors"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="shrink-0">
                    <ChequeIllustration />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-ink">
                      Drag a voided cheque here, or{' '}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="text-brand-accent-dark hover:text-brand-ink underline-offset-4 hover:underline transition-colors"
                      >
                        browse files
                      </button>
                      .
                    </p>
                    <p className="mt-1 text-xs text-brand-muted">
                      PNG, JPG, or PDF. We use this to confirm the routing and account numbers.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading number={2}>Authorization</SectionHeading>
          <div className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
            <div className="relative">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="max-h-64 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-brand-ink/85"
              >
                <p className="text-xs uppercase tracking-[0.16em] font-tabular text-brand-muted mb-3">
                  Optimus partner authorization — draft, prototype copy
                </p>
                <p className="mb-3">
                  By signing below, you authorize Optimus to verify the information you've
                  provided through credit-bureau and reference checks, share your application
                  data with the lender(s) we route you to, and contact you about your
                  application status by email and SMS.
                </p>
                <p className="mb-3">
                  You confirm the information you've entered is accurate to the best of your
                  knowledge, that you're authorized to submit this application on behalf of the
                  business named, and that the beneficial owners listed reflect the actual
                  ownership structure as of today.
                </p>
                <p className="mb-3">
                  You agree to receive electronic disclosures, contracts, and notices from
                  Optimus and from the lenders to which Optimus may route your application. You
                  may withdraw consent for electronic communications at any time by contacting
                  Optimus support, in which case we may not be able to continue processing your
                  application electronically.
                </p>
                <p className="mb-3">
                  Your application data is transmitted over encrypted connections and stored
                  with the same protections used by regulated financial institutions. You can
                  request a copy of the data Optimus holds about you, or ask us to delete it,
                  by contacting privacy@optimus.example.
                </p>
                <p>
                  This authorization remains in effect until you revoke it in writing. The
                  electronic signature you provide below has the same legal effect as a
                  hand-written one under applicable U.S. and Canadian law.
                </p>
              </div>
              <div
                aria-hidden
                className="absolute right-1 top-4 bottom-4 w-1 rounded-full bg-stone-100"
              >
                <motion.div
                  animate={{ height: `${scrollProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                  className="w-full rounded-full bg-brand-accent-dark"
                />
              </div>
            </div>
            <motion.div
              initial={false}
              animate={{
                height: consent.scrolled ? 'auto' : 0,
                opacity: consent.scrolled ? 1 : 0,
              }}
              transition={reduce ? { duration: 0 } : { duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 border-t border-brand-border bg-brand-canvas">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent.agreed}
                    onChange={(e) => setConsent('agreed', e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-brand-border text-brand-accent-dark focus:ring-brand-accent"
                  />
                  <span className="text-sm text-brand-ink">
                    I have read and agree to the authorization above.
                  </span>
                </label>
              </div>
            </motion.div>
            {!consent.scrolled && (
              <div className="px-6 py-3 border-t border-brand-border bg-stone-50/60 text-xs text-brand-muted">
                Scroll to the end to continue.
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionHeading number={3}>Signature</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-end">
            <Field
              label="Type your full legal name"
              hint="By typing your name you sign electronically."
            >
              <div className="relative">
                <TextInput
                  autoComplete="name"
                  placeholder={signerNamePrefill || 'Your full legal name'}
                  value={consent.signatureName}
                  onChange={(e) => setConsent('signatureName', e.target.value)}
                  className="text-lg font-display font-medium tracking-tight pb-2"
                />
                {consent.signatureName && (
                  <motion.span
                    layoutId={reduce ? undefined : 'sig-underline'}
                    className="absolute left-3 right-3 bottom-1 h-px bg-brand-accent-dark"
                  />
                )}
              </div>
            </Field>
            <div className="text-xs text-brand-muted font-tabular tabular-nums md:pb-3">
              Date: {consent.signatureDate}
            </div>
          </div>
          {consent.signatureName && (
            <p className="mt-3 text-[11px] text-brand-muted font-tabular">
              Signed by <span className="text-brand-ink">{consent.signatureName}</span>{' '}
              on {consent.signatureDate}
            </p>
          )}
        </section>
      </div>
    </StepShell>
  );
}
