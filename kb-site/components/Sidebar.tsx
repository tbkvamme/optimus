import Link from 'next/link';
import { buildNavTree, type KbNode } from '@/lib/kb';

function renderNode(node: KbNode, depth: number) {
  const href = `/kb/${node.slug}`;
  return (
    <li key={node.slug} className={depth === 0 ? 'mt-1' : 'mt-0.5 ml-3'}>
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
  const tree = buildNavTree();

  return (
    <nav className="text-sm">
      <Link
        href="/kb"
        className="block py-1 px-2 rounded font-medium text-stone-900 hover:bg-stone-200"
      >
        Knowledgebase
      </Link>
      <ul className="mt-2">{tree.map((node) => renderNode(node, 0))}</ul>
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
