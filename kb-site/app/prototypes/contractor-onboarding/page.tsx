'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PrototypeBadge } from './_components/PrototypeBadge';
import { Step1Business } from './_components/Step1Business';
import { Step2Owners } from './_components/Step2Owners';
import { Step3Banking } from './_components/Step3Banking';
import { Submitted } from './_components/Submitted';
import { Welcome } from './_components/Welcome';
import { EASE_OUT, emptyForm, type FormState, newOwner } from './_components/types';

type Step = 'welcome' | 1 | 2 | 3 | 'submitted';

const TITLES: Record<Step | 'submitting', string> = {
  welcome: 'Optimus — Partner enrollment',
  1: 'Optimus — Step 1 of 4: Business basics',
  2: 'Optimus — Step 2 of 4: Beneficial owners',
  3: 'Optimus — Step 3 of 4: Banking',
  submitted: 'Optimus — Application submitted',
  submitting: 'Optimus — Submitting…',
};

export default function Page() {
  const [step, setStep] = useState<Step>('welcome');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    document.title = submitting ? TITLES.submitting : TITLES[step];
  }, [step, submitting]);

  // Scroll to top on each step change.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [step, reduce]);

  const startEnrollment = () => setStep(1);

  const skipToDemo = () => {
    setForm({
      contact: {
        firstName: 'Maria',
        lastName: 'Hernandez',
        title: 'President',
        email: 'maria@hernandez-hvac.example',
        mobile: '555 123 4567',
        smsOptIn: true,
        isOwner: true,
      },
      business: {
        country: 'US',
        legalName: 'Hernandez HVAC LLC',
        dba: 'Hernandez Heating & Cooling',
        structure: 'LLC',
        taxId: '47-2853910',
        license: 'CA-HVAC-1438822',
        inBusinessSince: '2014',
        employees: '10–49',
        category: 'HVAC',
        hasWebsite: true,
        websiteUrl: 'https://hernandezhvac.example',
      },
      owners: [
        newOwner({
          firstName: 'Maria',
          lastName: 'Hernandez',
          title: 'President',
          email: 'maria@hernandez-hvac.example',
          phone: '555 123 4567',
          dobMonth: '06',
          dobDay: '14',
          dobYear: '1981',
          ownership: 60,
        }),
        newOwner({
          firstName: 'David',
          lastName: 'Chen',
          title: 'Operations',
          email: 'david@hernandez-hvac.example',
          phone: '555 988 2231',
          dobMonth: '03',
          dobDay: '02',
          dobYear: '1986',
          ownership: 40,
        }),
      ],
      banking: {
        accountHolder: 'Hernandez HVAC LLC',
        accountType: 'checking',
        routing: '',
        accountNumber: '',
        chequeFile: null,
      },
      consent: {
        scrolled: false,
        agreed: false,
        signatureName: '',
        signatureDate: new Date().toISOString().slice(0, 10),
      },
    });
    setStep(2);
  };

  const handleStep1Continue = () => {
    setForm((f) => {
      if (f.contact.isOwner && f.owners.length === 0) {
        return {
          ...f,
          owners: [
            newOwner({
              firstName: f.contact.firstName,
              lastName: f.contact.lastName,
              title: f.contact.title,
              email: f.contact.email,
              phone: f.contact.mobile,
              ownership: 100,
            }),
          ],
        };
      }
      return f;
    });
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setStep('submitted');
  };

  const variants = reduce
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
    : {
        initial: { opacity: 0, x: 18 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -18 },
      };

  return (
    <>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <Welcome onBegin={startEnrollment} onSkipToDemo={skipToDemo} />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.3 }}
          >
            <Step1Business
              contact={form.contact}
              business={form.business}
              onChangeContact={(contact) => setForm((f) => ({ ...f, contact }))}
              onChangeBusiness={(business) => setForm((f) => ({ ...f, business }))}
              onContinue={handleStep1Continue}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.3 }}
          >
            <Step2Owners
              owners={form.owners}
              onChange={(owners) => setForm((f) => ({ ...f, owners }))}
              onContinue={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.3 }}
          >
            <Step3Banking
              banking={form.banking}
              consent={form.consent}
              onChangeBanking={(banking) => setForm((f) => ({ ...f, banking }))}
              onChangeConsent={(consent) => setForm((f) => ({ ...f, consent }))}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
              signerNamePrefill={`${form.contact.firstName} ${form.contact.lastName}`.trim()}
            />
          </motion.div>
        )}
        {step === 'submitted' && (
          <motion.div
            key="submitted"
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.3 }}
          >
            <Submitted email={form.contact.email} />
          </motion.div>
        )}
      </AnimatePresence>
      <PrototypeBadge />
    </>
  );
}
