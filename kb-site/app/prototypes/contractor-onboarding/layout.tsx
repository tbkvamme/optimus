import type { Metadata } from 'next';
import { Bricolage_Grotesque, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-tabular',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Optimus — Partner enrollment',
  description: 'Apply to originate Optimus loans for your customers.',
};

export default function ContractorOnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${mono.variable} font-display bg-brand-canvas text-brand-ink min-h-screen antialiased`}
    >
      {children}
    </div>
  );
}
