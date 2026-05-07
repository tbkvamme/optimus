import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { ChromeShell } from '@/app/_components/ChromeShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Optimus KB',
  description: 'Optimus rewrite — knowledgebase and prototypes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ChromeShell sidebar={<Sidebar />}>{children}</ChromeShell>
      </body>
    </html>
  );
}
