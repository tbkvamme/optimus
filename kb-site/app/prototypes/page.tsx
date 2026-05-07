import Link from 'next/link';

type Prototype = {
  name: string;
  href: string;
  description: string;
  kind: 'static' | 'react';
};

const PROTOTYPES: Prototype[] = [
  {
    name: 'Contractor onboarding',
    href: '/prototypes/contractor-onboarding',
    description:
      'A polished walk-through of contractor enrollment — primary contact, business identification, beneficial owners with live 100%-sum validation, banking and signature, plus a "submitted" state aligned to the activation gate. Demonstrates a possible design direction for the partner-facing surfaces.',
    kind: 'react',
  },
];

export const metadata = { title: 'Prototypes — Optimus KB' };

export default function PrototypesIndex() {
  return (
    <article className="prose prose-stone max-w-none prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline">
      <h1>Prototypes</h1>
      <p>
        Demonstrations of in-progress design work. Each prototype is independent — vanilla
        HTML under <code>public/prototypes/</code> or a Next route under{' '}
        <code>app/prototypes/</code>. Add a folder, list it below, ship it.
      </p>
      {PROTOTYPES.length === 0 ? (
        <p className="text-stone-500">No prototypes yet.</p>
      ) : (
        <ul>
          {PROTOTYPES.map((p) => (
            <li key={p.href}>
              <Link href={p.href}>{p.name}</Link>{' '}
              <span className="text-xs text-stone-500 uppercase tracking-wide">{p.kind}</span>
              <br />
              <span className="text-sm text-stone-600">{p.description}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
