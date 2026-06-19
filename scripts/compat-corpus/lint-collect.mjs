#!/usr/bin/env node
/**
 * Collect every `.svelte` / `.svelte.js` / `.svelte.ts` source (including code
 * blocks inside markdown) from the lint-relevant upstream repos into
 * `compat/lint-corpus/sources/`, for the eslint-plugin-svelte output-parity
 * pipeline (scripts/compat-corpus/lint-verify.mjs).
 *
 * Unlike the compile corpus (svelte + svelte.dev only), the lint corpus also
 * pulls in `eslint-plugin-svelte` and `svelte-eslint-parser` — the two repos
 * whose own `.svelte` files (rule fixtures, parser fixtures, docs, demos)
 * exercise exactly the surface the linter must match. Each repo is optional:
 * if its submodule isn't checked out it's skipped with a notice.
 *
 * Markdown extraction mirrors collect.mjs (the compile corpus).
 *
 * Usage: node scripts/compat-corpus/lint-collect.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compat/lint-corpus");
const OUT = path.join(CORPUS, "sources");

// Repos to harvest, in priority order. `eslint-plugin-svelte` and
// `svelte-eslint-parser` are the lint-specific additions; svelte + svelte.dev
// give real-world breadth.
const REPOS = [
  { name: "eslint-plugin-svelte", dir: "submodules/eslint-plugin-svelte" },
  { name: "svelte-eslint-parser", dir: "submodules/svelte-eslint-parser" },
  { name: "svelte", dir: "submodules/svelte" },
  { name: "svelte.dev", dir: "submodules/svelte.dev" },
];

/** Recursively list files, skipping junk dirs. */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === ".svelte-kit" ||
      entry.name === "dist" ||
      entry.name === "build"
    )
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const isSvelteFile = (p) => p.endsWith(".svelte");
const isSvelteModule = (p) => p.endsWith(".svelte.js") || p.endsWith(".svelte.ts");

// ---- markdown extraction (same rules as collect.mjs) ---------------------

const FENCE_RE = /^```(\w+)[^\n]*\n([\s\S]*?)^```\s*$/gm;
const METADATA_RE = /(?:^|\n)\/\/\/ (\w+): (.+)/g;
const TWOSLASH_LINE_RE =
  /^\s*\/\/ @(errors|noErrors|filename|lib|target|module|moduleResolution|allowJs|checkJs|strict|noImplicitAny|types|jsx|esModuleInterop|skipLibCheck)\b.*\n?/gm;
const CUT_LINE_RE = /^\s*\/\/ ---cut(?:-before|-after)?---\s*\n?/gm;

function stripDiffMarkers(source) {
  return source
    .replace(/---([^ ]|[^ ][^]*?[^ ])---/g, () => "")
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
  const id = path.posix.join(repo, relPath.split(path.sep).join("/"));
  const dest = path.join(OUT, id);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, source);
  manifest.push({ id, kind });
}

function collectRepo(repo, dir) {
  if (!fs.existsSync(dir)) {
    console.log(`[lint-collect] ${repo}: submodule not checked out, skipping (${dir})`);
    return;
  }
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
    } else if (file.endsWith(".md")) {
      const snippets = extractFromMarkdown(fs.readFileSync(file, "utf8"));
      for (const s of snippets) {
        const kind = s.ext === ".svelte" ? "component" : "module";
        addEntry(repo, `${rel}/${s.index}${s.ext}`, kind, s.source);
        md++;
      }
    }
  }
  console.log(`[lint-collect] ${repo}: ${real} files + ${md} markdown snippets`);
}

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
for (const { name, dir } of REPOS) {
  if (only.length && !only.includes(name)) continue;
  collectRepo(name, path.join(ROOT, dir));
}

// Synthetic package.json at the corpus root so the oracle's SvelteKit/Svelte
// version detection (eslint-plugin-svelte resolves `@sveltejs/kit` / `svelte`
// by walking up from the file path) treats every source as a Svelte 5 +
// SvelteKit 2 project. rsvelte-lint fires the SvelteKit-conditional rules
// (no-goto-without-base, no-navigation-without-base, …) unconditionally, so
// without this the oracle would skip them and every such finding would read as
// a false positive. Declaring the deps makes both sides evaluate the same
// rule universe.
fs.writeFileSync(
  path.join(OUT, "package.json"),
  JSON.stringify(
    {
      name: "rsvelte-lint-corpus-fixtures",
      version: "0.0.0",
      private: true,
      dependencies: { "@sveltejs/kit": "^2.0.0", svelte: "^5.0.0" },
    },
    null,
    "\t",
  ) + "\n",
);

manifest.sort((a, b) => (a.id < b.id ? -1 : 1));
fs.mkdirSync(CORPUS, { recursive: true });
fs.writeFileSync(path.join(CORPUS, "manifest.json"), JSON.stringify(manifest, null, "\t") + "\n");
console.log(
  `[lint-collect] total: ${manifest.length} corpus entries -> ${path.relative(ROOT, OUT)}`,
);
