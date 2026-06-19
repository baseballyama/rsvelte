#!/usr/bin/env node
/**
 * Collect every .svelte / .svelte.js / .svelte.ts source (including code
 * blocks inside markdown files) from every repository listed in
 * `corpus-sources.json` into `compat/corpus/sources/`.
 *
 * The corpus is a single flat set of source repositories (all git submodules):
 * sveltejs/svelte + sveltejs/svelte.dev provide svelte's own fixtures and the
 * curated docs, and the real-world projects (bits-ui, flowbite-svelte, melt-ui,
 * shadcn-svelte, …) provide production component-library source. There is no
 * separate "ecosystem" track — to grow the corpus, add a submodule and a line
 * to `corpus-sources.json`. Each source is collected under its `id` prefix.
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
 * Usage: node scripts/compat-corpus/collect.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compat/corpus");
const OUT = path.join(CORPUS, "sources");

// The corpus source repositories — all git submodules. Each entry: { path, id,
// markdown, required }. `markdown` controls whether ```svelte / ```js+file
// fences inside .md docs are extracted (true for the curated svelte/svelte.dev
// docs, false for real-world projects whose docs carry non-Svelte doc tooling
// and pseudo-code the compiler rejects). `required` sources abort collection
// when absent (svelte is the compiler/version pin); others just warn + skip.
// To grow the corpus, add a submodule (see .gitmodules) and a line here.
const SOURCES = JSON.parse(fs.readFileSync(path.join(__dirname, "corpus-sources.json"), "utf8"));

/** Recursively list files, skipping node_modules/.git and other junk. */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".svelte-kit")
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function isSvelteFile(p) {
  return p.endsWith(".svelte");
}
function isSvelteModule(p) {
  return p.endsWith(".svelte.js") || p.endsWith(".svelte.ts");
}

// ---- markdown extraction -------------------------------------------------

const FENCE_RE = /^```(\w+)[^\n]*\n([\s\S]*?)^```\s*$/gm;
const METADATA_RE = /(?:^|\n)\/\/\/ (\w+): (.+)/g;
// Twoslash compiler directives used across svelte / svelte.dev docs.
const TWOSLASH_LINE_RE =
  /^\s*\/\/ @(errors|noErrors|filename|lib|target|module|moduleResolution|allowJs|checkJs|strict|noImplicitAny|types|jsx|esModuleInterop|skipLibCheck)\b.*\n?/gm;
const CUT_LINE_RE = /^\s*\/\/ ---cut(?:-before|-after)?---\s*\n?/gm;

// Same substitution trick as site-kit's renderer: the delimiters wrap
// non-greedy inner content. We drop `---`-wrapped (removed) content and keep
// `+++` / `:::` inner text. Leading `---` frontmatter fences in .svelte
// snippets do not exist (only in md front matter, which we never include).
function stripDiffMarkers(source) {
  return source
    .replace(/---([^ ]|[^ ][^]*?[^ ])---/g, (m, inner, offset, str) => {
      // keep a genuine frontmatter-style fence (line consisting solely of ---)
      return "";
    })
    .replace(/\+\+\+([^ ]|[^ ][^]*?[^ ])\+\+\+/g, "$1")
    .replace(/:::([^ ]|[^ ][^]*?[^ ])::::?/g, "$1");
}

function cleanSnippet(source) {
  let file = null;
  source = source.replace(METADATA_RE, (_, key, value) => {
    if (key === "file") file = value.trim();
    return "";
  });
  source = source.replace(TWOSLASH_LINE_RE, "");
  source = source.replace(CUT_LINE_RE, "");
  source = stripDiffMarkers(source);
  // marked-style 4-space indentation back to tabs (matches site-kit)
  source = source.replace(/^((?: {4})+)/gm, (m, spaces) => "\t".repeat(spaces.length / 4));
  return { source: source.trim() + "\n", file };
}

function extractFromMarkdown(mdSource) {
  const snippets = [];
  let match;
  FENCE_RE.lastIndex = 0;
  let index = 0;
  while ((match = FENCE_RE.exec(mdSource)) !== null) {
    const [, lang, body] = match;
    index++;
    if (lang === "svelte") {
      const { source } = cleanSnippet(body);
      if (source.trim()) snippets.push({ index, ext: ".svelte", source });
    } else if (lang === "js" || lang === "ts") {
      const { source, file } = cleanSnippet(body);
      if (file && /\.svelte\.(js|ts)$/.test(file) && source.trim()) {
        snippets.push({ index, ext: file.endsWith(".ts") ? ".svelte.ts" : ".svelte.js", source });
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
  const id = path.posix.join(repo, relPath.split(path.sep).join("/"));
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
// for those projects only their SHIPPED source files are collected.
function collectRepo(repo, dir, { markdown = true } = {}) {
  const files = walk(dir);
  let real = 0;
  let md = 0;
  for (const file of files) {
    const rel = path.relative(dir, file);
    if (isSvelteModule(file)) {
      addEntry(repo, rel, "module", fs.readFileSync(file, "utf8"));
      real++;
    } else if (isSvelteFile(file)) {
      addEntry(repo, rel, "component", fs.readFileSync(file, "utf8"));
      real++;
    } else if (markdown && file.endsWith(".md")) {
      const snippets = extractFromMarkdown(fs.readFileSync(file, "utf8"));
      for (const s of snippets) {
        const kind = s.ext === ".svelte" ? "component" : "module";
        addEntry(repo, `${rel}/${s.index}${s.ext}`, kind, s.source);
        md++;
      }
    }
  }
  console.log(`[collect] ${repo}: ${real} files + ${md} markdown snippets`);
}

for (const src of SOURCES) {
  const dir = path.resolve(ROOT, src.path);
  if (!fs.existsSync(dir) || fs.readdirSync(dir).length === 0) {
    if (src.required) {
      console.error(
        `[collect] required source ${src.id} missing at ${src.path} (run: git submodule update --init --depth 1 ${src.path})`,
      );
      process.exit(1);
    }
    console.warn(`[collect] source ${src.id} missing at ${src.path} — skipping`);
    console.warn(`  (run: git submodule update --init --depth 1 ${src.path} to include it)`);
    continue;
  }
  collectRepo(src.id, dir, { markdown: src.markdown ?? false });
}

manifest.sort((a, b) => (a.id < b.id ? -1 : 1));
fs.writeFileSync(path.join(CORPUS, "manifest.json"), JSON.stringify(manifest, null, "\t") + "\n");
console.log(`[collect] total: ${manifest.length} corpus entries -> ${path.relative(ROOT, OUT)}`);
