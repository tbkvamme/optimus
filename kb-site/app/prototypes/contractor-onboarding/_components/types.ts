export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type Country = 'US' | 'CA';

export type ContactState = {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  mobile: string;
  smsOptIn: boolean;
  isOwner: boolean;
};

export type BusinessState = {
  country: Country;
  legalName: string;
  dba: string;
  structure: string;
  taxId: string;
  license: string;
  inBusinessSince: string;
  employees: string;
  category: string;
  hasWebsite: boolean;
  websiteUrl: string;
};

export type Owner = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  dobMonth: string;
  dobDay: string;
  dobYear: string;
  ownership: number;
};

export type BankingState = {
  accountHolder: string;
  accountType: 'checking' | 'savings';
  routing: string;
  accountNumber: string;
  chequeFile: { name: string; size: number } | null;
};

export type ConsentState = {
  scrolled: boolean;
  agreed: boolean;
  signatureName: string;
  signatureDate: string;
};

export type FormState = {
  contact: ContactState;
  business: BusinessState;
  owners: Owner[];
  banking: BankingState;
  consent: ConsentState;
};

export const emptyForm = (): FormState => ({
  contact: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    mobile: '',
    smsOptIn: true,
    isOwner: false,
  },
  business: {
    country: 'US',
    legalName: '',
    dba: '',
    structure: '',
    taxId: '',
    license: '',
    inBusinessSince: '',
    employees: '',
    category: '',
    hasWebsite: true,
    websiteUrl: '',
  },
  owners: [],
  banking: {
    accountHolder: '',
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

export const newOwner = (overrides: Partial<Owner> = {}): Owner => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  phone: '',
  dobMonth: '',
  dobDay: '',
  dobYear: '',
  ownership: 0,
  ...overrides,
});

export const STRUCTURES_US = [
  'LLC',
  'C-Corporation',
  'S-Corporation',
  'Partnership',
  'Sole Proprietorship',
];

export const STRUCTURES_CA = [
  'Inc. (federal)',
  'Inc. (provincial)',
  'Partnership',
  'Sole Proprietorship',
];

export const CATEGORIES = [
  'HVAC',
  'Solar',
  'Roofing',
  'Windows',
  'Doors',
  'Plumbing',
  'Other',
];

export const EMPLOYEE_RANGES = ['1–9', '10–49', '50–249', '250+'];

export const formatTaxId = (raw: string, country: Country): string => {
  const digits = raw.replace(/\D/g, '');
  if (country === 'US') {
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
  }
  return digits.slice(0, 9);
};

export const taxIdLabel = (country: Country) =>
  country === 'US' ? 'Federal EIN' : 'Business Number (BN)';

export const taxIdPlaceholder = (country: Country) =>
  country === 'US' ? 'XX-XXXXXXX' : 'NNNNNNNNN';

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
