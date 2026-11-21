#!/usr/bin/env node
// Splits everything that differs from the merge base with the base branch (commits,
// uncommitted edits and untracked files) into chunks small enough for one reviewer to read
// closely, so that every round of the full-code-review skill reviews the same units.
//
// Usage: node .claude/skills/full-code-review/plan-chunks.ts [base] [--format=md]
// The base defaults to $BASE_BRANCH, then origin/main.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

type FileChange = { path: string; lines: number };

const MAX_LINES = 500;
const MAX_FILES = 10;
// A directory change closes the chunk once it holds this much.
const SOFT_LINES = 200;
const SOFT_FILES = 5;

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith('--')) ?? process.env.BASE_BRANCH ?? 'origin/main';
const format = args.includes('--format=md') ? 'md' : 'json';

// execFileSync, not a shell: the base comes from argv or the environment.
function git(gitArgs: string[]): string {
	return execFileSync('git', gitArgs, { encoding: 'utf8', maxBuffer: 1 << 28 });
}

let mergeBase: string;
try {
	mergeBase = git(['merge-base', base, 'HEAD']).trim();
} catch {
	console.error(
		`Error: '${base}' shares no history with HEAD. Run \`git fetch origin\` or pass a base.`,
	);
	process.exit(1);
}

// Binary files report `-` instead of a line count.
const count = (n: string) => (n === '-' ? 0 : Number(n));
const files = new Map<string, number>();
// Without `..HEAD` the diff runs against the working tree, so uncommitted edits count.
// `--no-renames` keeps every `-z` record as `adds<TAB>dels<TAB>path`.
for (const record of git(['diff', '--numstat', '--no-renames', '-z', mergeBase]).split('\0')) {
	if (!record) continue;
	const [adds = '0', dels = '0', ...rest] = record.split('\t');
	const path = rest.join('\t');
	if (path) files.set(path, count(adds) + count(dels));
}
for (const path of git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0')) {
	if (!path || files.has(path)) continue;
	let lines = 0;
	try {
		const buf = readFileSync(path);
		// The same rule as git: a NUL byte means binary, which has no lines.
		if (!buf.includes(0)) lines = buf.toString('utf8').split('\n').length;
	} catch {
		// A directory symlink cannot be read; list it without a size.
	}
	files.set(path, lines);
}

// Under corpus/, only hand-written files are reviewed. Copied inputs, oracle output, license
// copies and reports are data that tools write; a person does not read them line by line.
const REVIEWED_CORPUS_FILES =
	/^corpus\/(README\.md|_registry\/(sources|oracles)\.json|.+\/fixture\.toml)$/;

function skipReason(path: string): string | null {
	if (path.startsWith('corpus/') && !REVIEWED_CORPUS_FILES.test(path)) return 'corpus data';
	if (/(^|\/)(pnpm-lock\.yaml|Cargo\.lock)$/.test(path)) return 'lock files';
	return null;
}

// Ordered by review priority: code that ships first, data and prose last.
const CATEGORIES = [
	'rust',
	'rust tests',
	'tools',
	'corpus',
	'ci',
	'changeset',
	'docs',
	'other',
] as const;
type Category = (typeof CATEGORIES)[number];

function categoryOf(path: string): Category {
	if (path.startsWith('.github/')) return 'ci';
	if (path.startsWith('.changeset/')) return 'changeset';
	if (path.startsWith('corpus/')) return 'corpus';
	if (path.startsWith('crates/') && /\/(tests|benches)(\/|\.rs$)/.test(path)) return 'rust tests';
	if (path.endsWith('.rs') || /(^|\/)Cargo\.toml$/.test(path) || path.startsWith('crates/'))
		return 'rust';
	if (path.startsWith('tools/') || path.startsWith('apps/') || path.startsWith('.claude/'))
		return 'tools';
	if (/\.(ts|mts|js|mjs|svelte)$/.test(path)) return 'tools';
	if (path.endsWith('.md')) return 'docs';
	return 'other';
}

const dirOf = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf('/')));

function commonPrefix(paths: string[]): string {
	const [first = [], ...rest] = paths.map((p) => p.split('/'));
	if (rest.length === 0) return paths[0] ?? '';
	const out: string[] = [];
	for (const [i, part] of first.slice(0, -1).entries()) {
		if (!rest.every((s) => s[i] === part)) break;
		out.push(part);
	}
	return out.length > 0 ? `${out.join('/')}/` : '(repository root)';
}

type Group = { files: string[]; lines: number; dir: string };

function chunk(category: Category, list: FileChange[]) {
	list.sort((a, b) => a.path.localeCompare(b.path));
	const groups: Group[] = [];
	let cur: Group | null = null;
	for (const f of list) {
		const close =
			cur !== null &&
			(cur.lines + f.lines > MAX_LINES ||
				cur.files.length >= MAX_FILES ||
				(cur.dir !== dirOf(f.path) && (cur.lines >= SOFT_LINES || cur.files.length >= SOFT_FILES)));
		if (cur === null || close) {
			cur = { files: [], lines: 0, dir: '' };
			groups.push(cur);
		}
		cur.files.push(f.path);
		cur.lines += f.lines;
		cur.dir = dirOf(f.path);
	}
	// A small leftover joins the previous chunk rather than taking a reviewer alone.
	for (let i = groups.length - 1; i > 0; i--) {
		const [prev, g] = [groups[i - 1]!, groups[i]!];
		const small = g.lines < SOFT_LINES / 2 && g.files.length <= 2;
		if (
			small &&
			prev.lines + g.lines <= MAX_LINES &&
			prev.files.length + g.files.length <= MAX_FILES
		) {
			prev.files.push(...g.files);
			prev.lines += g.lines;
			groups.splice(i, 1);
		}
	}
	return groups.map((g, i) => ({
		category,
		name: `${category}${groups.length > 1 ? ` ${i + 1}/${groups.length}` : ''}: ${commonPrefix(g.files)}`,
		files: g.files,
		lines: g.lines,
	}));
}

const skipped: Record<string, string[]> = {};
const buckets = new Map<Category, FileChange[]>(CATEGORIES.map((c) => [c, []]));
for (const [path, lines] of files) {
	const reason = skipReason(path);
	if (reason !== null) (skipped[reason] ??= []).push(path);
	else buckets.get(categoryOf(path))?.push({ path, lines });
}

const chunks = CATEGORIES.flatMap((c) => chunk(c, buckets.get(c) ?? [])).map((c, i) =>
	Object.assign(c, { index: i + 1 }),
);

if (format === 'json') {
	console.log(JSON.stringify({ base, mergeBase, files: files.size, skipped, chunks }, null, 2));
} else {
	const skippedText =
		Object.entries(skipped)
			.map(([reason, paths]) => `${reason}: ${paths.length}`)
			.join(', ') || 'none';
	const out = [
		`Base: \`${base}\` (merge base \`${mergeBase.slice(0, 10)}\`), ${files.size} files, ${chunks.length} chunks, skipped: ${skippedText}`,
		'',
		'| # | Chunk | Files | Lines |',
		'|---|-------|-------|-------|',
		...chunks.map((c) => `| ${c.index} | ${c.name} | ${c.files.length} | ${c.lines} |`),
		'',
	];
	for (const c of chunks) {
		out.push(`**${c.index}. ${c.name}**`, ...c.files.map((f) => `- \`${f}\``), '');
	}
	console.log(out.join('\n'));
}
