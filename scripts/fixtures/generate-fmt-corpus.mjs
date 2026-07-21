/**
 * generate-fmt-corpus.mjs
 *
 * Oracle generator for the svelte.dev formatter parity corpus.
 *
 * Oracle = `oxfmt` with the canonical config (`fmt-corpus.oxfmtrc.json`, which
 * enables `svelte: true`). With `svelte: true`, oxfmt formats `.svelte` through
 * `prettier-plugin-svelte` for the Svelte structure while formatting embedded
 * JS/CSS with its own (oxc) engine — exactly rsvelte-fmt's own architecture, so
 * a full diff isolates rsvelte's Svelte-structure formatting from the JS/CSS
 * layer (identical on both sides by construction).
 *
 * Three stages, all keyed by the svelte.dev SHA:
 *   Stage 1  files/<relpath>/{input,expected}.svelte
 *            every `.svelte` file in the checkout.
 *   Stage 2  blocks/<md-relpath>/<idx>-svelte/{input,expected}.svelte
 *            ```svelte fenced code blocks in markdown, with svelte.dev
 *            highlight markers stripped. Blocks oxfmt rejects are skipped.
 *   Stage 3  markdown/<relpath>/{input,expected}.md
 *            whole markdown files (oxfmt formats embedded code blocks). Drives
 *            the rsvelte-fmt CLI delegation test (config forwarding to oxfmt).
 *
 * Output (gitignored, cached in CI keyed by the svelte.dev SHA):
 *   fixtures/fmt-corpus/<svelte.dev-short-sha>/{manifest.json,files/,blocks/,markdown/}
 *
 * Env:
 *   OXFMT_BIN     path to the oxfmt launcher (default: <repo>/node_modules/.bin/oxfmt)
 *   OXFMT_CONFIG  path to the canonical config (default: this dir / fmt-corpus.oxfmtrc.json)
 *   OXFMT_CONCURRENCY  parallel oxfmt invocations (default 8)
 *
 * Flags: --force (regenerate even if the SHA dir exists), --verbose (log skips).
 */

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SVELTE_DEV = path.join(ROOT, 'submodules', 'svelte.dev');

const FORCE = process.argv.includes('--force');
const VERBOSE = process.argv.includes('--verbose');

const OXFMT_BIN = process.env.OXFMT_BIN || path.join(ROOT, 'node_modules', '.bin', 'oxfmt');
const OXFMT_CONFIG =
  process.env.OXFMT_CONFIG || path.join(__dirname, 'fmt-corpus.oxfmtrc.json');
const CONCURRENCY = Number(process.env.OXFMT_CONCURRENCY || 8);

// Ids the corpus permanently excludes because the oxfmt oracle itself is buggy
// or the input is invalid — the same list `scripts/compat-corpus/fmt-verify.mjs`
// honors. The svelte.dev-scoped ones (prefix `svelte.dev/`) must be dropped here
// too, otherwise the byte-exact `svelte_dev_corpus.rs` gate re-introduces them
// (e.g. oxfmt's `--svelte` CSS path wraps a nested `calc()` differently from its
// own raw-CSS path — an oracle inconsistency, not an rsvelte bug).
const EXCLUDED_PATH = path.join(ROOT, 'compatibility', 'fmt-oracle-excluded.json');
const EXCLUDED_REL = new Set(
  (fs.existsSync(EXCLUDED_PATH)
    ? JSON.parse(fs.readFileSync(EXCLUDED_PATH, 'utf8'))
    : []
  )
    .map((e) => e.id)
    .filter((id) => id.startsWith('svelte.dev/'))
    .map((id) => id.slice('svelte.dev/'.length)),
);

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.svelte-kit',
  'build',
  'dist',
  '.vercel',
  '.output',
  'target',
]);

const MARKDOWN_EXTS = new Set(['.md', '.svx']);

function fail(msg) {
  console.error(`[generate-fmt-corpus] ${msg}`);
  process.exit(1);
}

function getSvelteDevSha() {
  if (!fs.existsSync(SVELTE_DEV)) {
    fail(
      `submodule missing at ${SVELTE_DEV}.\n` +
        `Run: git submodule update --init submodules/svelte.dev`,
    );
  }
  return new Promise((resolve) => {
    execFile('git', ['-C', SVELTE_DEV, 'rev-parse', 'HEAD'], (err, stdout) => {
      if (err) fail(`could not resolve svelte.dev HEAD: ${err.message}`);
      resolve(stdout.trim());
    });
  });
}

function oxfmtVersion() {
  return new Promise((resolve) => {
    execFile(OXFMT_BIN, ['--version'], (err, stdout) => {
      if (err) {
        fail(
          `cannot run oxfmt at ${OXFMT_BIN}: ${err.message}\n` +
            `Set OXFMT_BIN to a working oxfmt launcher.`,
        );
      }
      resolve(stdout.trim());
    });
  });
}

function* walkFiles(dir, predicate) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkFiles(path.join(dir, entry.name), predicate);
    } else if (entry.isFile() && predicate(entry.name)) {
      yield path.join(dir, entry.name);
    }
  }
}

/** Run oxfmt over `source`, telling it the file is `filename` (drives the parser). */
function runOxfmt(source, filename) {
  return new Promise((resolve) => {
    const child = execFile(
      OXFMT_BIN,
      ['-c', OXFMT_CONFIG, '--stdin-filepath', filename],
      { maxBuffer: 64 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) resolve({ ok: false, err: (stderr || err.message || '').trim() });
        else resolve({ ok: true, out: stdout, stderr: (stderr || '').trim() });
      },
    );
    child.stdin.end(source);
  });
}

async function pool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
  return results;
}

/**
 * Extract ```svelte / ```sv fenced code blocks from markdown. Returns
 * `[{ index, raw }]` (0-based index among svelte blocks in the file).
 */
function extractSvelteBlocks(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  let idx = 0;
  while (i < lines.length) {
    const open = /^```(svelte|sv)\b/.test(lines[i].trim());
    if (open) {
      const body = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '```') {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ index: idx++, raw: body.join('\n') });
    } else {
      i++;
    }
  }
  return blocks;
}

/**
 * Strip svelte.dev tutorial highlight markers so the block becomes compilable
 * Svelte that reflects the "after" state:
 *  - `/// file: …` metadata lines      -> removed
 *  - `// ---cut---` / `---cut---` lines -> removed
 *  - `---…---` deletion spans           -> removed entirely (old code)
 *  - `+++…+++` insertion markers        -> delimiters removed, content kept
 */
function sanitizeBlock(src) {
  const kept = src.split('\n').filter((l) => {
    const t = l.trim();
    if (t.startsWith('/// file:')) return false;
    if (t.includes('---cut---')) return false;
    return true;
  });
  let out = kept.join('\n');
  out = out.replace(/---[\s\S]*?---/g, ''); // deletion spans
  out = out.replace(/\+\+\+/g, ''); // insertion delimiters
  return dedent(out);
}

/// Strip the common leading-whitespace prefix shared by every non-blank line.
/// Markdown code blocks nested under a list/indent carry that indentation, which
/// isn't part of the Svelte source — oxfmt drops it when formatting, so strip it
/// from rsvelte's input too (the oracle is unchanged: oxfmt dedents regardless).
function dedent(src) {
  const lines = src.split('\n');
  let prefix = null;
  for (const l of lines) {
    if (!l.trim()) continue;
    const ind = l.match(/^[ \t]*/)[0];
    if (prefix === null) {
      prefix = ind;
      continue;
    }
    let k = 0;
    while (k < prefix.length && k < ind.length && prefix[k] === ind[k]) k++;
    prefix = prefix.slice(0, k);
    if (!prefix) return src;
  }
  if (!prefix) return src;
  return lines.map((l) => (l.startsWith(prefix) ? l.slice(prefix.length) : l)).join('\n');
}

async function main() {
  const sha = await getSvelteDevSha();
  const shortSha = sha.slice(0, 12);
  const version = await oxfmtVersion();

  const outDir = path.join(ROOT, 'fixtures', 'fmt-corpus', shortSha);
  if (fs.existsSync(outDir) && !FORCE) {
    console.log(
      `[generate-fmt-corpus] fixtures already exist at fixtures/fmt-corpus/${shortSha} ` +
        `(use --force to regenerate)`,
    );
    return;
  }

  const configSrc = fs.readFileSync(OXFMT_CONFIG, 'utf8');
  const configHash = createHash('sha256').update(configSrc).digest('hex').slice(0, 16);

  const svelteFiles = [...walkFiles(SVELTE_DEV, (n) => n.endsWith('.svelte'))].sort();
  const mdFiles = [
    ...walkFiles(SVELTE_DEV, (n) => MARKDOWN_EXTS.has(path.extname(n))),
  ].sort();

  console.log(
    `[generate-fmt-corpus] svelte.dev@${shortSha} | oxfmt ${version} | config ${configHash}\n` +
      `  ${svelteFiles.length} .svelte files | ${mdFiles.length} markdown files`,
  );

  const tmpDir = `${outDir}.tmp-${process.pid}`;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const skips = [];
  const counts = {
    files: { total: svelteFiles.length, generated: 0 },
    blocks: { total: 0, generated: 0 },
    markdown: { total: mdFiles.length, generated: 0 },
  };

  // ── Stage 1: .svelte files ────────────────────────────────────────────
  await pool(svelteFiles, async (absPath) => {
    const rel = path.relative(SVELTE_DEV, absPath).split(path.sep).join('/');
    const id = `files/${rel}`;
    if (EXCLUDED_REL.has(rel)) {
      skips.push({ id, reason: 'oracle-excluded (fmt-oracle-excluded.json)' });
      if (VERBOSE) console.log(`  skip ${id}: oracle-excluded`);
      return;
    }
    const source = fs.readFileSync(absPath, 'utf8');
    const res = await runOxfmt(source, path.basename(absPath));
    if (!res.ok) {
      skips.push({ id, reason: oneLine(res.err) || 'oxfmt failed' });
      if (VERBOSE) console.log(`  skip ${id}: ${oneLine(res.err)}`);
      return;
    }
    writeSample(path.join(tmpDir, 'files', rel), 'svelte', source, res.out);
    counts.files.generated++;
  });

  // ── Stage 2: svelte code blocks in markdown ───────────────────────────
  const blockItems = [];
  for (const absPath of mdFiles) {
    const rel = path.relative(SVELTE_DEV, absPath).split(path.sep).join('/');
    // The `llms*.txt/` docs are auto-generated concatenations of the whole
    // documentation; their ```svelte blocks stitch several components together
    // with `<!-- File.svelte -->` delimiters, so they aren't single, valid
    // Svelte sources. Skip them as block samples (they're not representative).
    if (/(^|\/)llms[^/]*\//.test(rel) || /(^|\/)llms[^/]*\.txt/.test(rel)) {
      continue;
    }
    const md = fs.readFileSync(absPath, 'utf8');
    for (const b of extractSvelteBlocks(md)) {
      blockItems.push({ rel, index: b.index, raw: b.raw });
    }
  }
  counts.blocks.total = blockItems.length;
  await pool(blockItems, async (item) => {
    const id = `blocks/${item.rel}/${item.index}-svelte`;
    const sanitized = sanitizeBlock(item.raw);
    if (!sanitized.trim()) {
      skips.push({ id, reason: 'empty after sanitization' });
      return;
    }
    // oxfmt round-trips on its own output; the oracle is what oxfmt produces
    // for the sanitized source, and the test feeds the SAME sanitized source
    // to rsvelte. Append a trailing newline so the stdin source is a normal
    // file shape.
    const source = sanitized.endsWith('\n') ? sanitized : `${sanitized}\n`;
    const res = await runOxfmt(source, 'block.svelte');
    if (!res.ok) {
      skips.push({ id, reason: oneLine(res.err) || 'oxfmt failed' });
      if (VERBOSE) console.log(`  skip ${id}: ${oneLine(res.err)}`);
      return;
    }
    // oxfmt formats `.svelte` whole-block and leaves an unparseable embedded
    // `<script>` / `<style>` verbatim while logging the error to stderr (exit 0).
    // Such a block is not valid, formattable Svelte — rsvelte's per-piece parse
    // would (correctly) reject it — so exclude it from the parity corpus rather
    // than treat the unformatted oracle as a target. These are docs snippets
    // that intentionally show broken code.
    if (/error/i.test(res.stderr)) {
      skips.push({ id, reason: `oxfmt stderr: ${oneLine(res.stderr)}` });
      if (VERBOSE) console.log(`  skip ${id}: invalid embedded code`);
      return;
    }
    writeSample(
      path.join(tmpDir, 'blocks', item.rel, `${item.index}-svelte`),
      'svelte',
      source,
      res.out,
    );
    counts.blocks.generated++;
  });

  // ── Stage 3: whole markdown files ─────────────────────────────────────
  await pool(mdFiles, async (absPath) => {
    const rel = path.relative(SVELTE_DEV, absPath).split(path.sep).join('/');
    const id = `markdown/${rel}`;
    const source = fs.readFileSync(absPath, 'utf8');
    const res = await runOxfmt(source, path.basename(absPath));
    if (!res.ok) {
      skips.push({ id, reason: oneLine(res.err) || 'oxfmt failed' });
      if (VERBOSE) console.log(`  skip ${id}: ${oneLine(res.err)}`);
      return;
    }
    writeSample(path.join(tmpDir, 'markdown', rel), 'md', source, res.out);
    counts.markdown.generated++;
  });

  const manifest = {
    corpus: 'svelte.dev',
    sha,
    shortSha,
    oxfmtVersion: version,
    configHash,
    generatedAt: new Date().toISOString(),
    counts,
    skipped: skips.length,
    skips: skips.sort((a, b) => a.id.localeCompare(b.id)),
  };
  fs.writeFileSync(
    path.join(tmpDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(outDir), { recursive: true });
  fs.renameSync(tmpDir, outDir);

  console.log(
    `[generate-fmt-corpus] done -> fixtures/fmt-corpus/${shortSha}\n` +
      `  files:    ${counts.files.generated}/${counts.files.total}\n` +
      `  blocks:   ${counts.blocks.generated}/${counts.blocks.total}\n` +
      `  markdown: ${counts.markdown.generated}/${counts.markdown.total}\n` +
      `  skipped:  ${skips.length}`,
  );
}

function writeSample(dir, ext, input, expected) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `input.${ext}`), input);
  fs.writeFileSync(path.join(dir, `expected.${ext}`), expected);
}

function oneLine(s) {
  return (s || '').replace(/\s+/g, ' ').trim().slice(0, 200);
}

main().catch((e) => fail(e.stack || String(e)));
