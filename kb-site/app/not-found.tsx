import Link from 'next/link';

export default function NotFound() {
  return (
    <article className="prose prose-stone max-w-none">
      <h1>Not found</h1>
      <p>The page you tried to reach doesn't exist in this knowledgebase.</p>
      <p>
        <Link href="/kb">Go to the KB index →</Link>
      </p>
    </article>
  );
}
