import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

const EXTERNAL_RE = /^(https?:|mailto:|tel:|#)/i;
const IMAGE_EXT_RE = /\.(?:png|jpe?g|gif|svg|webp|avif)$/i;

type RewriteResult = { type: 'keep'; url: string } | { type: 'unlink' };

function rewriteLinkUrl(url: string, slugParts: string[], validSlugs: Set<string>): RewriteResult {
  if (!url) return { type: 'keep', url };
  if (EXTERNAL_RE.test(url)) return { type: 'keep', url };
  if (url.startsWith('/')) return { type: 'keep', url };

  const [pathRaw, hashRaw] = url.split('#');
  const hash = hashRaw ? `#${hashRaw}` : '';
  const path = pathRaw;

  if (!path.endsWith('.md')) {
    return { type: 'unlink' };
  }

  const stripped = path.replace(/\.md$/, '');
  const baseParts = slugParts.slice(0, -1);
  const segments = stripped.split('/');
  const stack = [...baseParts];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (stack.length === 0) return { type: 'unlink' };
      stack.pop();
    } else {
      stack.push(seg);
    }
  }

  if (stack.length === 1 && stack[0] === 'index') {
    return { type: 'keep', url: `/kb${hash}` };
  }
  const slug = stack.join('/');
  if (!validSlugs.has(slug)) {
    return { type: 'unlink' };
  }
  return { type: 'keep', url: `/kb/${slug}${hash}` };
}

function rewriteImageUrl(url: string): string {
  if (!url || EXTERNAL_RE.test(url) || url.startsWith('/')) return url;
  const [pathRaw, hashRaw] = url.split('#');
  const hash = hashRaw ? `#${hashRaw}` : '';
  const diagramMatch = pathRaw.match(/(?:^|\/)diagrams\/([^/]+\.[a-z0-9]+)$/i);
  if (diagramMatch && IMAGE_EXT_RE.test(diagramMatch[1])) {
    return `/kb-diagrams/${diagramMatch[1]}${hash}`;
  }
  return url;
}

function flattenText(nodes: any[]): string {
  if (!Array.isArray(nodes)) return '';
  return nodes
    .map((n) => {
      if (typeof n.value === 'string') return n.value;
      if (Array.isArray(n.children)) return flattenText(n.children);
      return '';
    })
    .join('');
}

export async function renderMarkdown(
  content: string,
  slugParts: string[],
  validSlugs: Set<string>,
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => (tree: any) => {
      visit(tree, (node: any) => {
        if (node.type === 'image' && typeof node.url === 'string') {
          node.url = rewriteImageUrl(node.url);
          return;
        }
        if (node.type === 'link' && typeof node.url === 'string') {
          const result = rewriteLinkUrl(node.url, slugParts, validSlugs);
          if (result.type === 'keep') {
            node.url = result.url;
            return;
          }
          // Unlink: replace with plain text in place.
          node.type = 'text';
          node.value = flattenText(node.children);
          delete node.url;
          delete node.children;
          delete node.title;
          return;
        }
        if (node.type === 'definition' && typeof node.url === 'string') {
          const result = rewriteLinkUrl(node.url, slugParts, validSlugs);
          if (result.type === 'keep') node.url = result.url;
        }
      });
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return String(file);
}
