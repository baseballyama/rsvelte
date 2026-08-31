#!/usr/bin/env node
// Split the SCSS gate's `css-mismatch` entries by whether the divergence can change
// rendering. `--list` answers "what does the text differ in", which is a different
// question: a colour spelled two ways is one colour, and a declaration that merely
// moved is a cascade change with no textual smell.
//
// Both outputs are flattened to an ordered list of (selector chain, property, value)
// and compared: equal lists are render-neutral, equal multisets in a different order
// are the `mixed-decls` class, anything else is a real value difference.
//
// CANON_COLORS=1 folds every colour spelling to one `rgba()` form (channels rounded to
// 8 bits, alpha to four decimals) before comparing. Both numbers are worth reading —
// 155/59/2 with it and 111/51/54 without — because "cosmetic" is a line someone drew.
//
//   cargo build --release -p rsvelte_preprocess --bin scss_parity
//   CANON_COLORS=1 node scripts/compat-corpus/scss-classify.mjs [out.json]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCES_PATH = path.join(ROOT, 'scripts/compat-corpus/corpus-sources.json');
const SHIM_ROOT = path.join(ROOT, 'compatibility', 'scss-node-modules-shim');
const LANG_ATTR = /\b(?:lang|type)\s*=\s*"([^"]*)"/;
const STYLE_TAG = /<style(\s[^>]*)?>([\s\S]*?)<\/style>/g;

function styleSyntax(attributes) {
  const value = LANG_ATTR.exec(attributes ?? '')?.[1] ?? '';
  const lang = value.replace(/^text\//, '');
  if (lang === 'scss') return 'scss';
  if (lang === 'sass') return 'indented';
  return null;
}
function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name === 'node_modules' || e.name === '.git') continue; walk(full, out); }
    else if (e.isFile()) out.push(full);
  }
  return out;
}
function collect() {
  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
  const units = [];
  for (const source of sources) {
    const root = path.join(ROOT, source.path);
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root, [])) {
      const rel = path.relative(ROOT, file);
      const ext = path.extname(file);
      if (ext === '.scss' || ext === '.sass') {
        units.push({ id: rel, source: fs.readFileSync(file, 'utf8'), indented: ext === '.sass', filename: file });
      } else if (ext === '.svelte') {
        const text = fs.readFileSync(file, 'utf8');
        let m, i = 0;
        STYLE_TAG.lastIndex = 0;
        while ((m = STYLE_TAG.exec(text))) {
          const syntax = styleSyntax(m[1]);
          if (syntax) units.push({ id: `${rel}#style${i}`, source: m[2], indented: syntax === 'indented', filename: file });
          i++;
        }
      }
    }
  }
  units.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return units;
}

const WANTED = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'compatibility/scss-known-failures.json'), 'utf8'))
    .filter((e) => e.verdict === 'css-mismatch')
    .map((e) => e.id),
);
const all = collect();
const units = all.filter((u) => WANTED.has(u.id));
console.error(`[classify] ${units.length} css-mismatch units of ${all.length} collected`);

const sass = await import('sass');
const oracle = units.map((u) => {
  try {
    return { ok: true, css: sass.compileString(u.source, { syntax: u.indented ? 'indented' : 'scss', style: 'expanded', loadPaths: [path.dirname(u.filename), SHIM_ROOT], logger: sass.Logger.silent }).css };
  } catch (e) { return { ok: false, error: String(e?.message ?? e) }; }
});

const exe = path.join(ROOT, 'target/release/scss_parity');
const payload = JSON.stringify(units.map(({ id, source, indented, filename }) => ({ id, source, indented, filename, loadPaths: [SHIM_ROOT] })));
const actual = [];
while (actual.length < units.length) {
  const run = spawnSync(exe, ['--from', String(actual.length)], { input: payload, maxBuffer: 512 * 1024 * 1024, encoding: 'utf8' });
  for (const line of run.stdout.split('\n')) if (line.trim()) actual.push(JSON.parse(line));
  if (actual.length >= units.length) break;
  actual.push({ ok: false, error: 'panic' });
}

// --- semantic flattening -----------------------------------------------------
const NAMED = { black:[0,0,0], white:[255,255,255], red:[255,0,0], lime:[0,255,0], blue:[0,0,255],
  gray:[128,128,128], grey:[128,128,128], darkgray:[169,169,169], darkgrey:[169,169,169],
  lightgray:[211,211,211], lightgrey:[211,211,211], silver:[192,192,192], maroon:[128,0,0],
  olive:[128,128,0], green:[0,128,0], purple:[128,0,128], teal:[0,128,128], navy:[0,0,128],
  yellow:[255,255,0], fuchsia:[255,0,255], magenta:[255,0,255], aqua:[0,255,255], cyan:[0,255,255],
  orange:[255,165,0], transparent:[0,0,0,0] };
const r4 = (n) => Math.round(n * 10000) / 10000;
const ch = (t, scale) => {
  t = t.trim();
  if (t.endsWith('%')) return r4(parseFloat(t) * scale / 100);
  return r4(parseFloat(t));
};
const alpha = (t) => (t === undefined ? 1 : t.trim().endsWith('%') ? r4(parseFloat(t) / 100) : r4(parseFloat(t)));
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const seg = Math.floor(h / 60) % 6;
  const [r, g, b] = [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][seg];
  return [r + m, g + m, b + m].map((v) => r4(v * 255));
}
function canonColors(v) {
  // hex
  v = v.replace(/#([0-9a-f]{3,8})\b/gi, (m, h) => {
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return m;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    const a = h.length === 8 ? r4(n(6) / 255) : 1;
    return `rgba(${n(0)},${n(2)},${n(4)},${a})`;
  });
  // rgb/rgba
  v = v.replace(/\brgba?\(([^()]*)\)/gi, (m, args) => {
    const parts = args.split(/[,\/]/).map((t) => t.trim()).filter(Boolean);
    if (parts.length < 3) return m;
    const [r, g, b] = parts.slice(0, 3).map((t) => ch(t, 255));
    if ([r, g, b].some(Number.isNaN)) return m;
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha(parts[3])})`;
  });
  // hsl/hsla
  v = v.replace(/\bhsla?\(([^()]*)\)/gi, (m, args) => {
    const parts = args.split(/[,\/]/).map((t) => t.trim()).filter(Boolean);
    if (parts.length < 3) return m;
    const h = parseFloat(parts[0].replace(/deg$/i, ''));
    const s = parseFloat(parts[1]), l = parseFloat(parts[2]);
    if ([h, s, l].some(Number.isNaN)) return m;
    const [r, g, b] = hslToRgb(h, s, l);
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha(parts[3])})`;
  });
  // named
  v = v.replace(/\b([a-z]+)\b/gi, (m, w) => {
    const k = w.toLowerCase();
    if (!(k in NAMED)) return m;
    const [r, g, b, a = 1] = NAMED[k];
    return `rgba(${r},${g},${b},${a})`;
  });
  return v;
}
const normValueRaw = (v) =>
  v.replace(/'/g, '"')
   .replace(/\s+/g, ' ')
   .replace(/\s*([,()])\s*/g, '$1')
   .trim()
   .toLowerCase();
const COLOR = process.env.CANON_COLORS === '1';
const normValue = (v) => (COLOR ? normValueRaw(canonColors(v)) : normValueRaw(v));
const normSelector = (s) => s.replace(/'/g, '"').replace(/\s+/g, ' ').replace(/\s*([,>+~])\s*/g, '$1').trim();

// A hand-rolled reader rather than postcss, so this script needs no dependency the
// repository does not already declare. Its input is dart-sass / `grass` output in
// `expanded` style — well-formed, unminified CSS — not arbitrary author source.
function flatten(css) {
  const out = [];
  const chain = [];
  let i = 0;
  let buf = '';
  const n = css.length;
  const emit = (decl) => {
    const c = decl.indexOf(':');
    if (c === -1) return;
    let prop = decl.slice(0, c).trim().toLowerCase();
    let value = decl.slice(c + 1).trim();
    let important = false;
    const bang = value.toLowerCase().lastIndexOf('!important');
    if (bang !== -1) { value = value.slice(0, bang); important = true; }
    if (!prop) return;
    out.push(chain.join(' || ') + ' >> ' + prop + ':' + normValue(value) + (important ? '!' : ''));
  };
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      buf += c;
      i++;
      while (i < n) {
        buf += css[i];
        if (css[i] === '\\') { i += 2; if (i <= n) buf += css[i - 1]; continue; }
        if (css[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }
    if (c === '(') {
      let depth = 0;
      while (i < n) {
        buf += css[i];
        if (css[i] === '(') depth++;
        else if (css[i] === ')') { depth--; i++; if (depth === 0) break; continue; }
        i++;
      }
      continue;
    }
    if (c === '{') {
      const prelude = buf.trim();
      buf = '';
      i++;
      chain.push(prelude.startsWith('@')
        ? '@' + normValue(prelude.slice(1))
        : 'R:' + normSelector(prelude));
      continue;
    }
    if (c === '}') {
      if (buf.trim()) emit(buf.trim());
      buf = '';
      i++;
      if (chain.length === 0) return null;
      chain.pop();
      continue;
    }
    if (c === ';') {
      const t = buf.trim();
      buf = '';
      i++;
      // A body-less at-rule (`@import …;`) is a statement, not a declaration.
      if (t.startsWith('@')) out.push(chain.join(' || ') + ' >> ' + '@' + normValue(t.slice(1)));
      else emit(t);
      continue;
    }
    buf += c;
    i++;
  }
  if (buf.trim()) emit(buf.trim());
  return chain.length === 0 ? out : null;
}

const rows = [];
for (let i = 0; i < units.length; i++) {
  const u = units[i], o = oracle[i], a = actual[i];
  if (!o.ok || !a.ok) { rows.push({ id: u.id, cls: 'not-both-ok' }); continue; }
  const fo = flatten(o.css), fa = flatten(a.css);
  if (!fo || !fa) { rows.push({ id: u.id, cls: 'unparseable' }); continue; }
  if (fo.join('\n') === fa.join('\n')) { rows.push({ id: u.id, cls: 'render-neutral' }); continue; }
  // Same multiset, different order -> cascade
  const so = [...fo].sort().join('\n'), sa = [...fa].sort().join('\n');
  rows.push({ id: u.id, cls: so === sa ? 'order-differs' : 'content-differs', fo, fa });
}
const by = {};
for (const r of rows) by[r.cls] = (by[r.cls] || 0) + 1;
console.log(JSON.stringify(by, null, 1));
fs.writeFileSync(process.argv[2] ?? '/tmp/scss_classes.json', JSON.stringify(rows.map(r => ({ id: r.id, cls: r.cls })), null, 1));
// print a few examples of each non-neutral class
for (const cls of ['order-differs', 'content-differs', 'unparseable', 'not-both-ok']) {
  const ex = rows.filter((r) => r.cls === cls).slice(0, 3);
  for (const r of ex) {
    console.log(`\n--- ${cls}: ${r.id}`);
    if (r.fo) {
      const n = Math.max(r.fo.length, r.fa.length);
      let shown = 0;
      for (let k = 0; k < n && shown < 6; k++) if (r.fo[k] !== r.fa[k]) { console.log('  dart: ' + (r.fo[k] ?? '<eof>')); console.log('  grass: ' + (r.fa[k] ?? '<eof>')); shown++; }
    }
  }
}
