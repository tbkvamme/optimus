import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const KB_ROOT = resolve(process.cwd(), '..', 'docs', 'kb');

export type KbNode = {
  slug: string;
  slugParts: string[];
  title: string;
  filePath: string;
  children: KbNode[];
};

const TITLE_RE = /^#\s+(.+)$/m;

function readTitle(filePath: string, fallback: string): string {
  try {
    const content = readFileSync(filePath, 'utf8');
    const match = content.match(TITLE_RE);
    return match ? match[1].trim() : fallback;
  } catch {
    return fallback;
  }
}

function buildNode(slugParts: string[], filePath: string, children: KbNode[] = []): KbNode {
  const slug = slugParts.join('/');
  const fallback = slugParts[slugParts.length - 1] ?? slug;
  return {
    slug,
    slugParts,
    title: readTitle(filePath, fallback),
    filePath,
    children,
  };
}

export function buildNavTree(): KbNode[] {
  if (!existsSync(KB_ROOT)) return [];
  const entries = readdirSync(KB_ROOT);
  const mdFiles = new Set(entries.filter((e) => e.endsWith('.md') && e !== 'index.md'));
  const folders = entries.filter((e) => {
    if (e.startsWith('.') || e === 'diagrams') return false;
    return statSync(join(KB_ROOT, e)).isDirectory();
  });

  const nodes: KbNode[] = [];

  for (const file of [...mdFiles].sort()) {
    const name = file.replace(/\.md$/, '');
    const filePath = join(KB_ROOT, file);
    const childFolder = folders.includes(name) ? join(KB_ROOT, name) : null;
    const children: KbNode[] = [];
    if (childFolder) {
      const childEntries = readdirSync(childFolder)
        .filter((e) => e.endsWith('.md'))
        .sort();
      for (const childFile of childEntries) {
        const childName = childFile.replace(/\.md$/, '');
        children.push(
          buildNode([name, childName], join(childFolder, childFile)),
        );
      }
    }
    nodes.push(buildNode([name], filePath, children));
  }

  return nodes;
}

export function getAllSlugParts(): string[][] {
  const tree = buildNavTree();
  const all: string[][] = [];
  const walk = (nodes: KbNode[]) => {
    for (const n of nodes) {
      all.push(n.slugParts);
      if (n.children.length) walk(n.children);
    }
  };
  walk(tree);
  return all;
}

export function findFilePathForSlug(slugParts: string[]): string | null {
  if (slugParts.length === 0) {
    const indexPath = join(KB_ROOT, 'index.md');
    return existsSync(indexPath) ? indexPath : null;
  }
  const candidate = join(KB_ROOT, ...slugParts) + '.md';
  return existsSync(candidate) ? candidate : null;
}

export function readKbFile(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

export function findNodeBySlug(slugParts: string[]): KbNode | null {
  const tree = buildNavTree();
  let current: KbNode[] = tree;
  let found: KbNode | null = null;
  for (const part of slugParts) {
    const next = current.find((n) => n.slugParts[n.slugParts.length - 1] === part);
    if (!next) return null;
    found = next;
    current = next.children;
  }
  return found;
}

export function getValidSlugSet(): Set<string> {
  return new Set(getAllSlugParts().map((parts) => parts.join('/')));
}

export function getKbIndexTitle(): string {
  const indexPath = join(KB_ROOT, 'index.md');
  if (!existsSync(indexPath)) return 'Knowledgebase';
  return readTitle(indexPath, 'Knowledgebase');
}
