import type { Metadata } from 'next';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Optimus KB',
  description: 'Optimus rewrite — knowledgebase and prototypes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-stone-900">
              Optimus
            </Link>
            <nav className="text-sm text-stone-600 flex gap-4">
              <Link href="/kb" className="hover:text-stone-900">KB</Link>
              <Link href="/prototypes" className="hover:text-stone-900">Prototypes</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-8">
          <aside className="md:sticky md:top-6 md:self-start md:max-h-[calc(100vh-3rem)] md:overflow-y-auto">
            <Sidebar />
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
