import { findFilePathForSlug, getValidSlugSet, readKbFile } from '@/lib/kb';
import { renderMarkdown } from '@/lib/markdown';
import { notFound } from 'next/navigation';

export default async function KbIndexPage() {
  const filePath = findFilePathForSlug([]);
  if (!filePath) notFound();
  const content = readKbFile(filePath);
  const html = await renderMarkdown(content, [], getValidSlugSet());

  return (
    <article
      className="prose prose-stone max-w-none prose-img:rounded-md prose-img:border prose-img:border-stone-200 prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
