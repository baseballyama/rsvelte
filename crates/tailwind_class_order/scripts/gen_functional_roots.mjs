// Extract the multi-segment functional utility roots registered by Tailwind v4
// (`grid-cols`, `ring-offset`, `inset-shadow`, `flex-grow`, …) so a utility name
// resolves to its true root by longest match instead of the first `-` segment.
// Parsed from the compiled engine's registration calls.
import fs from 'node:fs';
import path from 'node:path';

const dist = fs.readFileSync(
  path.join(path.dirname(new URL(import.meta.resolve('tailwindcss/package.json')).pathname), 'dist/lib.mjs'),
  'utf8',
);
const names = new Set();
for (const m of dist.matchAll(/functional\("([a-z@][a-zA-Z0-9-]*)"/g)) names.add(m[1]);
for (const m of dist.matchAll(/\bn\("([a-z-]+)",\{/g)) names.add(m[1]);
const compound = [...names].filter((x) => x.includes('-')).sort();
fs.writeFileSync('functional_roots.txt', compound.join('\n') + '\n');
console.log('compound functional roots:', compound.length);
