// Emit the default theme's container-query breakpoint names in ascending size
// order, so `@xl` sorts before `@5xl` (by size, not by string).
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

const rows = [];
for (const [k, v] of ds.theme.entries()) {
  if (k.startsWith('--container-')) rows.push([k.slice(12), parseFloat(v)]);
}
rows.sort((a, b) => a[1] - b[1]);
fs.writeFileSync('container_sizes.txt', rows.map((r) => r[0]).join('\n') + '\n');
console.log('containers:', rows.length);
