import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '..', '..', 'docs', 'kb', 'diagrams');
const dstDir = resolve(here, '..', 'public', 'kb-diagrams');

if (!existsSync(srcDir)) {
  console.error(`[copy-diagrams] source not found: ${srcDir}`);
  process.exit(1);
}

await mkdir(dstDir, { recursive: true });

const entries = await readdir(srcDir);
const pngs = entries.filter((f) => f.toLowerCase().endsWith('.png'));

for (const file of pngs) {
  await cp(join(srcDir, file), join(dstDir, file));
}

console.log(`[copy-diagrams] copied ${pngs.length} png file(s) → public/kb-diagrams/`);
