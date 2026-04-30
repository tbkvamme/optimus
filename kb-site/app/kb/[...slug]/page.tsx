import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  findFilePathForSlug,
  findNodeBySlug,
  getAllSlugParts,
  getValidSlugSet,
  readKbFile,
} from '@/lib/kb';
import { renderMarkdown } from '@/lib/markdown';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugParts().map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const node = findNodeBySlug(slug);
  return { title: node ? `${node.title} — Optimus KB` : 'Optimus KB' };
}

export default async function KbTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const filePath = findFilePathForSlug(slug);
  if (!filePath) notFound();

  const content = readKbFile(filePath);
  const html = await renderMarkdown(content, slug, getValidSlugSet());
  const node = findNodeBySlug(slug);

  return (
    <article className="min-w-0">
      <div
        className="prose prose-stone max-w-none prose-img:rounded-md prose-img:border prose-img:border-stone-200 prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline prose-table:text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {node && node.children.length > 0 && (
        <section className="mt-10 pt-6 border-t border-stone-200">
          <h2 className="text-base font-semibold text-stone-900 mb-3">Sub-topics</h2>
          <ul className="space-y-1">
            {node.children.map((child) => (
              <li key={child.slug}>
                <Link href={`/kb/${child.slug}`} className="text-sky-700 hover:underline">
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
