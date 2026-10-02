#!/usr/bin/env node
// Splits the diff against a base branch into small review chunks, so that every review
// run of the review skill reviews the same units.
//
// Usage: node .claude/scripts/plan-review-chunks.ts [base] [--format=md]
// Without a base, it picks whichever of origin/experimental and origin/main has the smaller diff.
// A candidate with no merge base is ignored (this branch may be an orphan).
import { execFileSync } from 'node:child_process';

type FileChange = { path: string; lines: number };
type Category = 'rust' | 'tools' | 'fixtures' | 'ci' | 'docs' | 'other';

const MAX_LINES_PER_CHUNK = 500;
const MAX_FILES_PER_CHUNK = 10;
const SOFT_BREAK_MIN_LINES = 200;
const SOFT_BREAK_MIN_FILES = 5;
const BASE_CANDIDATES = ['origin/experimental', 'origin/main'];

const args = process.argv.slice(2);
const explicitBase = args.find((a) => !a.startsWith('--')) ?? process.env.BASE_BRANCH ?? null;
const format = args.includes('--format=md') ? 'md' : 'json';

// execFileSync (no shell): the base name comes from argv and may contain shell characters.
function tryGit(gitArgs: string[]): string | null {
  try {
    return execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
  } catch {
    return null;
  }
}

// --no-renames: a rename shows as "old => new", which is not a real path.
function numstat(ref: string): FileChange[] | null {
  const out = tryGit(['diff', '--numstat', '--no-renames', `${ref}...HEAD`]);
  if (out === null) return null;
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [adds, dels, ...rest] = line.split('\t');
      const count = (s: string) => (s === '-' ? 0 : Number(s));
      return { path: rest.join('\t'), lines: count(adds) + count(dels) };
    });
}

function selectBase(): string {
  const existing = BASE_CANDIDATES.filter((ref) => tryGit(['merge-base', ref, 'HEAD']) !== null);
  if (existing.length === 0) {
    console.error(`Error: none of ${BASE_CANDIDATES.join(', ')} shares history with HEAD. Run \`git fetch origin\` or pass a base.`);
    process.exit(1);
  }
  const size = (ref: string) => (numstat(ref) ?? []).reduce((sum, f) => sum + f.lines, 0);
  return existing.reduce((best, ref) => (size(ref) < size(best) ? ref : best));
}

// Under fixtures/, only hand-written files are reviewed. Copied inputs, oracle output, license
// copies and reports are data that tools write; a person does not read them line by line.
const REVIEWED_FIXTURE_FILES = /^fixtures\/(README\.md|_registry\/(sources|oracles)\.json|.+\/fixture\.toml)$/;

function skipReason(path: string): string | null {
  if (path.startsWith('fixtures/') && !REVIEWED_FIXTURE_FILES.test(path)) return 'fixture data';
  if (/(^|\/)(pnpm-lock\.yaml|Cargo\.lock)$/.test(path)) return 'lock files';
  return null;
}

function categoryOf(path: string): Category {
  if (path.startsWith('.github/')) return 'ci';
  if (path.startsWith('fixtures/')) return 'fixtures';
  if (path.endsWith('.rs') || /(^|\/)Cargo\.toml$/.test(path) || path.startsWith('crates/')) return 'rust';
  if (path.startsWith('tools/') || path.startsWith('.claude/scripts/') || /\.(ts|mts|js|mjs)$/.test(path)) return 'tools';
  if (path.endsWith('.md')) return 'docs';
  return 'other';
}

function dirKey(path: string): string {
  const segs = path.split('/');
  return segs.slice(0, Math.min(segs.length - 1, 6)).join('/');
}

function commonDir(paths: string[]): string {
  if (paths.length === 1) return paths[0];
  const splits = paths.map((p) => p.split('/'));
  const out: string[] = [];
  for (let i = 0; i < Math.min(...splits.map((s) => s.length)) - 1; i++) {
    if (!splits.every((s) => s[i] === splits[0][i])) break;
    out.push(splits[0][i]);
  }
  return out.length > 0 ? `${out.join('/')}/` : '<mixed>';
}

function chunkFiles(category: Category, list: FileChange[]) {
  list.sort((a, b) => a.path.localeCompare(b.path));
  const groups: FileChange[][] = [];
  let current: FileChange[] = [];
  let lines = 0;
  for (const f of list) {
    const last = current.at(-1);
    const dirChanged = last !== undefined && dirKey(last.path) !== dirKey(f.path);
    const softBreak = lines >= SOFT_BREAK_MIN_LINES || current.length >= SOFT_BREAK_MIN_FILES;
    const full = lines + f.lines > MAX_LINES_PER_CHUNK || current.length + 1 > MAX_FILES_PER_CHUNK;
    if (current.length > 0 && (full || (dirChanged && softBreak))) {
      groups.push(current);
      current = [];
      lines = 0;
    }
    current.push(f);
    lines += f.lines;
  }
  if (current.length > 0) groups.push(current);
  return groups.map((g, i) => {
    const prefix = groups.length > 1 ? `${category} ${i + 1}/${groups.length}` : category;
    return {
      category,
      name: `${prefix}: ${commonDir(g.map((f) => f.path))}`,
      files: g.map((f) => f.path),
      totalLines: g.reduce((sum, f) => sum + f.lines, 0),
      fileCount: g.length,
    };
  });
}

if (explicitBase !== null && tryGit(['rev-parse', '--verify', '--quiet', explicitBase]) === null) {
  console.error(`Error: base branch '${explicitBase}' does not exist. Run \`git fetch origin\` or check the name.`);
  process.exit(1);
}
const baseBranch = explicitBase ?? selectBase();
const files = numstat(baseBranch);
if (files === null) {
  console.error(`Error: \`git diff ${baseBranch}...HEAD\` failed.`);
  process.exit(1);
}

const skipped: Record<string, number> = {};
const buckets = new Map<Category, FileChange[]>();
for (const f of files) {
  const reason = skipReason(f.path);
  if (reason !== null) {
    skipped[reason] = (skipped[reason] ?? 0) + 1;
    continue;
  }
  const cat = categoryOf(f.path);
  buckets.set(cat, [...(buckets.get(cat) ?? []), f]);
}

const order: Category[] = ['rust', 'tools', 'fixtures', 'ci', 'docs', 'other'];
const chunks = order
  .flatMap((cat) => chunkFiles(cat, buckets.get(cat) ?? []))
  .map((c, i, all) => ({ index: i + 1, total: all.length, ...c }));

if (format === 'md') {
  const skippedText = Object.entries(skipped).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none';
  const out = [
    '# Review chunks',
    '',
    `Base branch: \`${baseBranch}\``,
    `Total chunks: **${chunks.length}** (skipped files: ${skippedText})`,
    '',
    '| # | Chunk | Files | Lines |',
    '|---|-------|-------|-------|',
    ...chunks.map((c) => `| ${c.index} | ${c.name} | ${c.fileCount} | ${c.totalLines} |`),
    '',
    ...chunks.flatMap((c) => [`## ${c.index}. ${c.name}`, '', ...c.files.map((f) => `- \`${f}\``), '']),
  ];
  console.log(out.join('\n'));
} else {
  const thresholds = { maxLinesPerChunk: MAX_LINES_PER_CHUNK, maxFilesPerChunk: MAX_FILES_PER_CHUNK };
  console.log(JSON.stringify({ baseBranch, thresholds, totalChunks: chunks.length, skipped, chunks }, null, 2));
}
