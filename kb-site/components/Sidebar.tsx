import Link from 'next/link';
import { buildNavSections, type KbNode } from '@/lib/kb';

function renderNode(node: KbNode, depth: number) {
  const href = `/kb/${node.slug}`;
  return (
    <li key={node.slug} className={depth === 0 ? 'mt-0.5' : 'mt-0.5 ml-3'}>
      <Link
        href={href}
        className="block py-1 px-2 rounded text-sm text-stone-700 hover:bg-stone-200 hover:text-stone-900"
      >
        {node.title}
      </Link>
      {node.children.length > 0 && (
        <ul className="border-l border-stone-200 ml-2">
          {node.children.map((c) => renderNode(c, depth + 1))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar() {
  const sections = buildNavSections();

  return (
    <nav className="text-sm">
      <Link
        href="/kb"
        className="block py-1 px-2 rounded font-medium text-stone-900 hover:bg-stone-200"
      >
        Knowledgebase
      </Link>
      <div className="mt-2">
        {sections.map((section) => (
          <div key={section.title} className="mt-4 first:mt-2">
            <div className="px-2 pb-1 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              {section.title}
            </div>
            <ul>{section.nodes.map((node) => renderNode(node, 0))}</ul>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-stone-200">
        <Link
          href="/prototypes"
          className="block py-1 px-2 rounded font-medium text-stone-900 hover:bg-stone-200"
        >
          Prototypes
        </Link>
      </div>
    </nav>
  );
}
