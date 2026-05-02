#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const explicitBaseBranch = args.find((a) => !a.startsWith('--')) ?? process.env.BASE_BRANCH ?? null;
const format = args.includes('--format=md') ? 'md' : 'json';

const MAX_LINES_PER_CHUNK = 500;
const MAX_FILES_PER_CHUNK = 10;
const SOFT_BREAK_MIN_LINES = 200;
const SOFT_BREAK_MIN_FILES = 5;

// argv/環境変数経由で来るブランチ名にシェルメタ文字が混じる可能性があるため、
// shell 経由の execSync ではなく execFileSync (引数配列) でコマンドインジェクションを防ぐ。
function tryGit(gitArgs) {
  try {
    return execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

function branchExists(ref) {
  return tryGit(['rev-parse', '--verify', '--quiet', ref]) !== null;
}

function diffLines(ref) {
  const out = tryGit(['diff', '--numstat', `${ref}...HEAD`]);
  if (out === null) return null;
  let total = 0;
  for (const line of out.trim().split('\n').filter(Boolean)) {
    const parts = line.split('\t');
    const adds = parts[0] === '-' ? 0 : Number(parts[0]) || 0;
    const dels = parts[1] === '-' ? 0 : Number(parts[1]) || 0;
    total += adds + dels;
  }
  return total;
}

function selectBaseBranch() {
  const candidates = ['origin/main', 'origin/master', 'origin/develop'].filter(branchExists);
  if (candidates.length === 0) {
    throw new Error(
      'No base branch found (origin/main, origin/master, origin/develop). Run `git fetch origin` or pass a base branch explicitly.',
    );
  }
  if (candidates.length === 1) return candidates[0];

  let best = candidates[0];
  let bestLines = diffLines(best) ?? Number.POSITIVE_INFINITY;
  for (const ref of candidates.slice(1)) {
    const lines = diffLines(ref) ?? Number.POSITIVE_INFINITY;
    if (lines < bestLines) {
      best = ref;
      bestLines = lines;
    }
  }
  return best;
}

const baseBranch = explicitBaseBranch ?? selectBaseBranch();

const raw = execFileSync('git', ['diff', '--numstat', `${baseBranch}...HEAD`], {
  encoding: 'utf8',
});

const files = raw
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const parts = line.split('\t');
    const adds = parts[0] === '-' ? 0 : Number(parts[0]);
    const dels = parts[1] === '-' ? 0 : Number(parts[1]);
    const path = parts.slice(2).join('\t');
    return { path, lines: adds + dels };
  })
  .filter((f) => f.path && f.lines >= 0);

// rsvelte 用カテゴリ分類:
// - ast        : src/ast/ 配下（コンパイラ全体の基盤データ構造。Phase 3 で集中的にレビューするため Phase 4 ではスキップ）
// - submodule  : svelte/, vite-plugin-svelte/, language-tools/, fixtures/ 配下（外部由来 / 自動生成。レビュー対象外）
// - parse      : src/compiler/phases/1_parse/
// - analyze    : src/compiler/phases/2_analyze/
// - transform  : src/compiler/phases/3_transform/（Client / Server / CSS いずれもここ）
// - error      : src/error/（エラー・警告メッセージ定義）
// - napi       : src/lib.rs, src/napi*, src/bin/* （N-API バインディング、CLI バイナリ）
// - tests      : tests/, benches/, examples/ 配下
// - infra      : .github/, scripts/, build.rs, Cargo.toml, Cargo.lock, package.json, Dockerfile 系, docker-compose.yml
// - docs       : *.md, docs/ 配下
// - other      : 上記いずれにも該当しないもの
function categoryOf(path) {
  if (path.startsWith('src/ast/')) return 'ast';
  if (
    path.startsWith('svelte/') ||
    path.startsWith('vite-plugin-svelte/') ||
    path.startsWith('language-tools/') ||
    path.startsWith('fixtures/')
  )
    return 'submodule';
  if (path.startsWith('src/compiler/phases/1_parse/')) return 'parse';
  if (path.startsWith('src/compiler/phases/2_analyze/')) return 'analyze';
  if (path.startsWith('src/compiler/phases/3_transform/')) return 'transform';
  if (path.startsWith('src/error/')) return 'error';
  if (
    path === 'src/lib.rs' ||
    path.startsWith('src/napi') ||
    path.startsWith('src/bin/') ||
    path.startsWith('npm/')
  )
    return 'napi';
  if (path.startsWith('tests/') || path.startsWith('benches/') || path.startsWith('examples/'))
    return 'tests';
  if (
    path.startsWith('.github/') ||
    path.startsWith('scripts/') ||
    path === 'build.rs' ||
    path === 'Cargo.toml' ||
    path === 'Cargo.lock' ||
    path === 'package.json' ||
    path === 'pnpm-lock.yaml' ||
    path === 'Dockerfile' ||
    path.startsWith('docker') ||
    path === '.devcontainer' ||
    path.startsWith('.devcontainer/') ||
    path.startsWith('.githooks/')
  )
    return 'infra';
  if (path.endsWith('.md') || path.startsWith('docs/')) return 'docs';
  if (path.startsWith('src/')) return 'other_src';
  return 'other';
}

function dirKey(path) {
  const segs = path.split('/');
  return segs.slice(0, Math.min(segs.length - 1, 6)).join('/');
}

function commonDir(paths) {
  if (paths.length === 0) return '';
  if (paths.length === 1) return paths[0];
  const splits = paths.map((p) => p.split('/'));
  const minLen = Math.min(...splits.map((s) => s.length));
  const out = [];
  for (let i = 0; i < minLen - 1; i++) {
    const seg = splits[0][i];
    if (splits.every((s) => s[i] === seg)) out.push(seg);
    else break;
  }
  return out.length > 0 ? out.join('/') + '/' : '<mixed>';
}

function chunkFiles(category, list) {
  if (list.length === 0) return [];
  list.sort((a, b) => a.path.localeCompare(b.path));

  const chunks = [];
  let current = { files: [], lines: 0, dir: null };

  for (const f of list) {
    const fileDir = dirKey(f.path);
    const dirChanged = current.dir !== null && current.dir !== fileDir;
    const wouldExceedLines = current.lines + f.lines > MAX_LINES_PER_CHUNK;
    const wouldExceedFiles = current.files.length + 1 > MAX_FILES_PER_CHUNK;
    const reachedSoftBreak =
      current.lines >= SOFT_BREAK_MIN_LINES || current.files.length >= SOFT_BREAK_MIN_FILES;

    const shouldFinalize =
      current.files.length > 0 &&
      (wouldExceedLines || wouldExceedFiles || (dirChanged && reachedSoftBreak));

    if (shouldFinalize) {
      chunks.push(current);
      current = { files: [], lines: 0, dir: null };
    }

    current.files.push(f);
    current.lines += f.lines;
    current.dir = fileDir;
  }
  if (current.files.length > 0) chunks.push(current);

  return chunks.map((c, i) => ({
    categoryIndex: i + 1,
    categoryTotal: chunks.length,
    category,
    name:
      chunks.length > 1
        ? `${category} ${i + 1}/${chunks.length}: ${commonDir(c.files.map((x) => x.path))}`
        : `${category}: ${commonDir(c.files.map((x) => x.path))}`,
    files: c.files.map((x) => x.path),
    totalLines: c.lines,
    fileCount: c.files.length,
  }));
}

const buckets = {
  parse: [],
  analyze: [],
  transform: [],
  error: [],
  napi: [],
  tests: [],
  infra: [],
  docs: [],
  other_src: [],
  other: [],
};
const skipped = { ast: 0, submodule: 0 };
for (const f of files) {
  const cat = categoryOf(f.path);
  if (cat === 'ast') {
    skipped.ast += 1;
    continue;
  }
  if (cat === 'submodule') {
    skipped.submodule += 1;
    continue;
  }
  buckets[cat].push(f);
}

// レビュー順序: パイプライン順（parse → analyze → transform）→ error → napi → tests → infra → docs → other
const merged = [
  ...chunkFiles('parse', buckets.parse),
  ...chunkFiles('analyze', buckets.analyze),
  ...chunkFiles('transform', buckets.transform),
  ...chunkFiles('error', buckets.error),
  ...chunkFiles('napi', buckets.napi),
  ...chunkFiles('tests', buckets.tests),
  ...chunkFiles('other_src', buckets.other_src),
  ...chunkFiles('infra', buckets.infra),
  ...chunkFiles('docs', buckets.docs),
  ...chunkFiles('other', buckets.other),
];

const totalChunks = merged.length;
const chunks = merged.map((c, i) => ({
  index: i + 1,
  total: totalChunks,
  categoryIndex: c.categoryIndex,
  categoryTotal: c.categoryTotal,
  category: c.category,
  name: c.name,
  files: c.files,
  totalLines: c.totalLines,
  fileCount: c.fileCount,
}));

const result = {
  baseBranch,
  thresholds: {
    maxLinesPerChunk: MAX_LINES_PER_CHUNK,
    maxFilesPerChunk: MAX_FILES_PER_CHUNK,
  },
  totalChunks,
  skipped: {
    astFiles: skipped.ast,
    submoduleFiles: skipped.submodule,
  },
  chunks,
};

if (format === 'md') {
  const lines = [
    `# Phase 4 Review Chunks`,
    ``,
    `Base branch: \`${baseBranch}\``,
    `Total chunks: **${totalChunks}** (ast files skipped: ${skipped.ast}, submodule/fixture files skipped: ${skipped.submodule})`,
    ``,
    `| # | Chunk | Files | Lines |`,
    `|---|-------|-------|-------|`,
    ...chunks.map((c, i) => `| ${i + 1} | ${c.name} | ${c.fileCount} | ${c.totalLines} |`),
    ``,
    `## Files per chunk`,
    ``,
    ...chunks.flatMap((c, i) => [
      `### ${i + 1}. ${c.name} (${c.fileCount} files, ${c.totalLines} lines)`,
      ``,
      ...c.files.map((f) => `- \`${f}\``),
      ``,
    ]),
  ];
  console.log(lines.join('\n'));
} else {
  console.log(JSON.stringify(result, null, 2));
}
