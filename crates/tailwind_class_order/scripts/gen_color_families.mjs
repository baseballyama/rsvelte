// Emit the default theme's color-family namespace (one per line), used to tell
// a color utility (`text-red-500`) from a same-root non-color one (`text-sm`).
import { __unstable__loadDesignSystem } from 'tailwindcss';
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync('default.css', 'utf8');
const twRoot = path.dirname(new URL(import.meta.resolve('tailwindcss/index.css')).pathname);
const loadStylesheet = (id, base) => {
  let p =
    id === 'tailwindcss'
      ? path.join(twRoot, 'index.css')
      : id.startsWith('tailwindcss/')
        ? path.join(twRoot, id.slice(12))
        : path.resolve(base, id);
  if (!p.endsWith('.css')) p += '.css';
  return { base: path.dirname(p), content: fs.readFileSync(p, 'utf8') };
};

const ds = await __unstable__loadDesignSystem(css, {
  base: process.cwd(),
  loadStylesheet,
  loadModule: () => { throw new Error('no js modules'); },
});

const fams = new Set();
for (const [key] of ds.theme.entries()) {
  if (key.startsWith('--color-')) fams.add(key.slice(8).split('-')[0]);
}
fs.writeFileSync('color_families.txt', [...fams].sort().join('\n') + '\n');
console.log('color families:', fams.size);
