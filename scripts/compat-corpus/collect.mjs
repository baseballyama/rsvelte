#!/usr/bin/env node
/**
 * Collect every .svelte / .svelte.js / .svelte.ts source (including code
 * blocks inside markdown files) from the sveltejs/svelte submodule and a
 * pinned sveltejs/svelte.dev checkout into `compat/corpus/sources/`.
 *
 * Markdown extraction rules (mirrors svelte.dev's site-kit renderer):
 *   - ```svelte fences            -> .svelte snippets
 *   - ```js / ```ts fences with a `/// file: X.svelte.(js|ts)` option
 *                                 -> module snippets
 *   - `/// key: value` metadata lines are stripped
 *   - twoslash directives (`// @errors:`, `// @noErrors`, ...) are stripped
 *   - `// ---cut---` marker lines are stripped (code above is kept; it is
 *     required for the snippet to be self-contained)
 *   - +++added+++ / :::highlighted::: keep their inner text,
 *     ---removed--- content is dropped (we compile the "after" state)
 *
 * Usage: node scripts/compat-corpus/collect.mjs [--svelte-dev <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compat/corpus');
const OUT = path.join(CORPUS, 'sources');

const args = process.argv.slice(2);
function argValue(name, fallback) {
	const i = args.indexOf(name);
	return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
// --eco-only collects ONLY the cloned ecosystem projects (skips svelte +
// svelte.dev), so the manifest — and therefore every downstream track — is
// scoped to the real-world corpus. Used to measure ecosystem compatibility in
// isolation without dragging the 6k-entry base corpus through compile/verify.
const ECO_ONLY = args.includes('--eco-only');

const SVELTE_DIR = path.join(ROOT, 'submodules/svelte');
// svelte.dev is a submodule (kept current by auto-update-submodules.yml,
// shared with the fmt parity corpus).
const SVELTE_DEV_DIR = path.resolve(ROOT, argValue('--svelte-dev', 'submodules/svelte.dev'));

if (!fs.existsSync(path.join(SVELTE_DIR, 'packages/svelte/package.json'))) {
	console.error(`[collect] svelte submodule missing at ${SVELTE_DIR} (run git submodule update --init)`);
	process.exit(1);
}
const HAVE_SVELTE_DEV = fs.existsSync(SVELTE_DEV_DIR);
if (!HAVE_SVELTE_DEV) {
	console.warn(`[collect] svelte.dev checkout missing at ${SVELTE_DEV_DIR} — skipping it`);
	console.warn('  (run: git submodule update --init --depth 1 submodules/svelte.dev to include it)');
}

// Real-world ecosystem projects (bits-ui, melt-ui, flowbite-svelte, …) are
// cloned on demand into compat/ecosystem-ci/checkout/<name>/ (gitignored) by
// scripts/compat-corpus/sync-ecosystem.mjs. When present, every `.svelte` /
// `.svelte.(js|ts)` source they ship is folded into the corpus under an
// `eco-<name>/…` id prefix so the same byte-equality / svelte2tsx / formatter
// tracks run over production component libraries, not just svelte's own
// fixtures. Absent (the default in CI for the base corpus), nothing changes.
const ECO_CHECKOUT_DIR = path.join(ROOT, 'compat/ecosystem-ci/checkout');

/** Recursively list files, skipping node_modules/.git and other junk. */
function walk(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.svelte-kit') continue;
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else if (entry.isFile()) out.push(full);
	}
	return out;
}

function isSvelteFile(p) {
	return p.endsWith('.svelte');
}
function isSvelteModule(p) {
	return p.endsWith('.svelte.js') || p.endsWith('.svelte.ts');
}

// ---- markdown extraction -------------------------------------------------

const FENCE_RE = /^```(\w+)[^\n]*\n([\s\S]*?)^```\s*$/gm;
const METADATA_RE = /(?:^|\n)\/\/\/ (\w+): (.+)/g;
// Twoslash compiler directives used across svelte / svelte.dev docs.
const TWOSLASH_LINE_RE = /^\s*\/\/ @(errors|noErrors|filename|lib|target|module|moduleResolution|allowJs|checkJs|strict|noImplicitAny|types|jsx|esModuleInterop|skipLibCheck)\b.*\n?/gm;
const CUT_LINE_RE = /^\s*\/\/ ---cut(?:-before|-after)?---\s*\n?/gm;

// Same substitution trick as site-kit's renderer: the delimiters wrap
// non-greedy inner content. We drop `---`-wrapped (removed) content and keep
// `+++` / `:::` inner text. Leading `---` frontmatter fences in .svelte
// snippets do not exist (only in md front matter, which we never include).
function stripDiffMarkers(source) {
	return source
		.replace(/---([^ ]|[^ ][^]*?[^ ])---/g, (m, inner, offset, str) => {
			// keep a genuine frontmatter-style fence (line consisting solely of ---)
			return '';
		})
		.replace(/\+\+\+([^ ]|[^ ][^]*?[^ ])\+\+\+/g, '$1')
		.replace(/:::([^ ]|[^ ][^]*?[^ ])::::?/g, '$1');
}

function cleanSnippet(source) {
	let file = null;
	source = source.replace(METADATA_RE, (_, key, value) => {
		if (key === 'file') file = value.trim();
		return '';
	});
	source = source.replace(TWOSLASH_LINE_RE, '');
	source = source.replace(CUT_LINE_RE, '');
	source = stripDiffMarkers(source);
	// marked-style 4-space indentation back to tabs (matches site-kit)
	source = source.replace(/^((?: {4})+)/gm, (m, spaces) => '\t'.repeat(spaces.length / 4));
	return { source: source.trim() + '\n', file };
}

function extractFromMarkdown(mdSource) {
	const snippets = [];
	let match;
	FENCE_RE.lastIndex = 0;
	let index = 0;
	while ((match = FENCE_RE.exec(mdSource)) !== null) {
		const [, lang, body] = match;
		index++;
		if (lang === 'svelte') {
			const { source } = cleanSnippet(body);
			if (source.trim()) snippets.push({ index, ext: '.svelte', source });
		} else if (lang === 'js' || lang === 'ts') {
			const { source, file } = cleanSnippet(body);
			if (file && /\.svelte\.(js|ts)$/.test(file) && source.trim()) {
				snippets.push({ index, ext: file.endsWith('.ts') ? '.svelte.ts' : '.svelte.js', source });
			}
		}
	}
	return snippets;
}

// ---- main ----------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const manifest = [];

function addEntry(repo, relPath, kind, source) {
	// corpus id: <repo>/<relative path>; markdown snippets append /<n>.<ext>
	const id = path.posix.join(repo, relPath.split(path.sep).join('/'));
	const dest = path.join(OUT, id);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.writeFileSync(dest, source);
	manifest.push({ id, kind });
}

// `markdown` controls whether ```svelte / ```js+file fences inside .md docs are
// extracted. The curated svelte / svelte.dev docs are designed to compile, so
// they are included; real-world project READMEs/doc-pages are not — they carry
// project-specific doc tooling (e.g. flowbite's non-Svelte `{#include X.svelte}`
// directive) and truncated pseudo-code the official compiler itself rejects, so
// the ecosystem corpus collects only each project's SHIPPED source files.
function collectRepo(repo, dir, { markdown = true } = {}) {
	const files = walk(dir);
	let real = 0;
	let md = 0;
	for (const file of files) {
		const rel = path.relative(dir, file);
		if (isSvelteModule(file)) {
			addEntry(repo, rel, 'module', fs.readFileSync(file, 'utf8'));
			real++;
		} else if (isSvelteFile(file)) {
			addEntry(repo, rel, 'component', fs.readFileSync(file, 'utf8'));
			real++;
		} else if (markdown && file.endsWith('.md')) {
			const snippets = extractFromMarkdown(fs.readFileSync(file, 'utf8'));
			for (const s of snippets) {
				const kind = s.ext === '.svelte' ? 'component' : 'module';
				addEntry(repo, `${rel}/${s.index}${s.ext}`, kind, s.source);
				md++;
			}
		}
	}
	console.log(`[collect] ${repo}: ${real} files + ${md} markdown snippets`);
}

if (!ECO_ONLY) {
	collectRepo('svelte', SVELTE_DIR);
	if (HAVE_SVELTE_DEV) collectRepo('svelte.dev', SVELTE_DEV_DIR);
}

// Fold in every cloned ecosystem project. Each lives under its own checkout
// directory; its id prefix is `eco-<name>` so a single `--filter eco-` (or
// `--filter eco-<name>`) scopes any track to the real-world corpus.
if (fs.existsSync(ECO_CHECKOUT_DIR)) {
	for (const entry of fs.readdirSync(ECO_CHECKOUT_DIR, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		collectRepo(`eco-${entry.name}`, path.join(ECO_CHECKOUT_DIR, entry.name), { markdown: false });
	}
}

manifest.sort((a, b) => (a.id < b.id ? -1 : 1));
fs.writeFileSync(path.join(CORPUS, 'manifest.json'), JSON.stringify(manifest, null, '\t') + '\n');
console.log(`[collect] total: ${manifest.length} corpus entries -> ${path.relative(ROOT, OUT)}`);
