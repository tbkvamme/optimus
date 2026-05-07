'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CountryFlag } from './icons';
import { StepShell } from './StepShell';
import {
  type BusinessState,
  CATEGORIES,
  type ContactState,
  type Country,
  EMPLOYEE_RANGES,
  formatTaxId,
  isEmail,
  STRUCTURES_CA,
  STRUCTURES_US,
  taxIdLabel,
  taxIdPlaceholder,
} from './types';
import { Field, SectionHeading, Select, TextInput, Toggle } from './ui';

type Props = {
  contact: ContactState;
  business: BusinessState;
  onChangeContact: (next: ContactState) => void;
  onChangeBusiness: (next: BusinessState) => void;
  onContinue: () => void;
};

export function Step1Business({
  contact,
  business,
  onChangeContact,
  onChangeBusiness,
  onContinue,
}: Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  const emailError =
    touched.email && contact.email && !isEmail(contact.email)
      ? 'Please enter a valid email.'
      : undefined;

  const minimalRequired =
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    contact.email.trim() &&
    isEmail(contact.email) &&
    contact.mobile.trim() &&
    business.legalName.trim() &&
    business.structure &&
    business.taxId.trim() &&
    business.category;

  const structures =
    business.country === 'US' ? STRUCTURES_US : STRUCTURES_CA;

  const setBiz = <K extends keyof BusinessState>(key: K, value: BusinessState[K]) =>
    onChangeBusiness({ ...business, [key]: value });
  const setContact = <K extends keyof ContactState>(key: K, value: ContactState[K]) =>
    onChangeContact({ ...contact, [key]: value });

  return (
    <StepShell
      step={1}
      title="About you and your company"
      helper="Quick basics — about 4 minutes. We'll get to ownership and banking next."
      onContinue={onContinue}
      continueDisabled={!minimalRequired}
    >
      <div className="space-y-12">
        <section>
          <SectionHeading number={1}>Primary contact</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            <Field label="First name">
              <TextInput
                autoComplete="given-name"
                value={contact.firstName}
                onChange={(e) => setContact('firstName', e.target.value)}
                onBlur={() => markTouched('firstName')}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                autoComplete="family-name"
                value={contact.lastName}
                onChange={(e) => setContact('lastName', e.target.value)}
                onBlur={() => markTouched('lastName')}
              />
            </Field>
            <Field label="Title" optional>
              <TextInput
                autoComplete="organization-title"
                placeholder="Owner, GM, Office Manager…"
                value={contact.title}
                onChange={(e) => setContact('title', e.target.value)}
              />
            </Field>
            <Field label="Email" error={emailError}>
              <TextInput
                type="email"
                autoComplete="email"
                value={contact.email}
                onChange={(e) => setContact('email', e.target.value)}
                onBlur={() => markTouched('email')}
              />
            </Field>
            <Field label="Mobile phone">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <CountryFlag country={business.country} />
                  <span className="text-xs font-tabular text-brand-muted">
                    {business.country === 'US' ? '+1' : '+1'}
                  </span>
                </span>
                <TextInput
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  className="pl-[78px]"
                  placeholder="555 123 4567"
                  value={contact.mobile}
                  onChange={(e) => setContact('mobile', e.target.value)}
                />
              </div>
            </Field>
            <div className="flex items-center md:pt-7">
              <Toggle
                checked={contact.smsOptIn}
                onChange={(v) => setContact('smsOptIn', v)}
                label="OK to text me"
                hint="Application updates and verification codes only."
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-brand-border bg-brand-surface px-4 py-4">
            <Toggle
              checked={contact.isOwner}
              onChange={(v) => setContact('isOwner', v)}
              label="I'm an owner of this business"
              hint={
                contact.isOwner
                  ? "We'll pre-fill the first beneficial owner with your details on the next step."
                  : 'Toggle on if your name should appear in the beneficial-owner list.'
              }
            />
            {contact.isOwner && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-brand-border text-xs text-brand-accent-dark flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-brand-accent" />
                We'll seed Owner 1 from this contact.
              </motion.p>
            )}
          </div>
        </section>

        <section>
          <SectionHeading number={2}>Business identification</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            <Field label="Country">
              <Select
                value={business.country}
                onChange={(e) => {
                  const next = e.target.value as Country;
                  onChangeBusiness({
                    ...business,
                    country: next,
                    structure: '',
                    taxId: '',
                  });
                }}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </Select>
            </Field>
            <Field label="Business legal name">
              <TextInput
                autoComplete="organization"
                value={business.legalName}
                onChange={(e) => setBiz('legalName', e.target.value)}
              />
            </Field>
            <Field label="Doing business as (DBA)" optional>
              <TextInput
                value={business.dba}
                onChange={(e) => setBiz('dba', e.target.value)}
              />
            </Field>
            <Field label="Business structure">
              <Select
                value={business.structure}
                onChange={(e) => setBiz('structure', e.target.value)}
              >
                <option value="">Select…</option>
                {structures.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={taxIdLabel(business.country)}
              hint={`Format: ${taxIdPlaceholder(business.country)}`}
            >
              <TextInput
                inputMode="numeric"
                placeholder={taxIdPlaceholder(business.country)}
                value={business.taxId}
                onChange={(e) =>
                  setBiz('taxId', formatTaxId(e.target.value, business.country))
                }
                className="font-tabular tabular-nums tracking-wide"
              />
            </Field>
            <Field label="Contractor license #" optional>
              <TextInput
                value={business.license}
                onChange={(e) => setBiz('license', e.target.value)}
              />
            </Field>
            <Field label="In business since">
              <TextInput
                inputMode="numeric"
                placeholder="2015"
                maxLength={4}
                className="font-tabular tabular-nums"
                value={business.inBusinessSince}
                onChange={(e) =>
                  setBiz('inBusinessSince', e.target.value.replace(/\D/g, ''))
                }
              />
            </Field>
            <Field label="Number of employees">
              <Select
                value={business.employees}
                onChange={(e) => setBiz('employees', e.target.value)}
              >
                <option value="">Select…</option>
                {EMPLOYEE_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Primary business category">
              <Select
                value={business.category}
                onChange={(e) => setBiz('category', e.target.value)}
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Website">
              {business.hasWebsite ? (
                <div className="space-y-2">
                  <TextInput
                    type="url"
                    autoComplete="url"
                    placeholder="https://"
                    value={business.websiteUrl}
                    onChange={(e) => setBiz('websiteUrl', e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-xs text-brand-muted hover:text-brand-ink transition-colors"
                    onClick={() => setBiz('hasWebsite', false)}
                  >
                    No website
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-10 px-3 flex items-center rounded-lg border border-dashed border-brand-border text-sm text-brand-muted">
                    No website on file
                  </div>
                  <button
                    type="button"
                    className="text-xs text-brand-accent-dark hover:text-brand-ink transition-colors"
                    onClick={() => setBiz('hasWebsite', true)}
                  >
                    Add a website
                  </button>
                </div>
              )}
            </Field>
          </div>
        </section>
      </div>
    </StepShell>
  );
}
