// `virtual:rsvelte-source`: the Rust modules the site explains, split into items and highlighted at
// build time. Pages quote code by item key; a key that no longer exists fails the build instead of
// showing stale code. Highlighting here keeps the Worker's per-request CPU at rendering only.

import { performanceHistory } from './performance-history.ts';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createCssVariablesTheme as createStylesheetVariablesTheme, createHighlighter, type Highlighter } from 'shiki';
import type { Plugin } from 'vite';
import { parseRustModule, type RustModule } from './rust-items.ts';
import { sources } from './sources.ts';

const VIRTUAL = 'virtual:rsvelte-source';
const RESOLVED = '\0' + VIRTUAL;

function readBaseline(file: string) {
	const record = JSON.parse(readFileSync(file, 'utf8')) as {
		'allocs': number;
		phases: Record<string, { 'allocs': number }>;
	};
	const { allocs: allocations, ...fields } = record;
	const phases = Object.fromEntries(Object.entries(record.phases).map(([name, phase]) => {
		const { allocs: allocations, ...fields } = phase;
		return [name, { ...fields, allocations }];
	}));
	return { ...fields, allocations, phases };
}

export interface HighlightedItem {
	key: string;
	kind: string;
	name: string;
	startLine: number;
	endLine: number;
	docs: string;
	code: string;
	markup: string;
}

export interface HighlightedModule {
	key: string;
	path: string;
	docs: string;
	lines: number;
	items: HighlightedItem[];
}

/** Token colours are CSS variables (`--shiki-token-*` in app.css), so one pass serves both themes. */
const theme = createStylesheetVariablesTheme({ name: 'rsvelte', variablePrefix: '--shiki-', fontStyle: true });

export function highlight(h: Highlighter, code: string, lang: string): string {
	return h.codeToHtml(code, { lang, theme: 'rsvelte' });
}

export interface CrateSize {
	name: string;
	files: number;
	/** Lines of Rust under src/, tests included. */
	lines: number;
}

function crateSizes(cratesDir: string): CrateSize[] {
	return readdirSync(cratesDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => {
			const files = readdirSync(path.join(cratesDir, d.name, 'src'), { recursive: true, encoding: 'utf8' }).filter(
				(f) => f.endsWith('.rs')
			);
			const lines = files.reduce(
				(n, f) => n + readFileSync(path.join(cratesDir, d.name, 'src', f), 'utf8').split('\n').length - 1,
				0
			);
			return { name: d.name, files: files.length, lines };
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

export interface ParityRow {
	task: string;
	verdicts: Record<string, number>;
}

/** fixtures/_registry/parity.json (`"<task>/<variant> <unit>": verdict`), counted per task and verdict. */
function paritySummary(entries: Record<string, string>): { units: number; rows: ParityRow[] } {
	const byTask = new Map<string, Record<string, number>>();
	for (const [key, verdict] of Object.entries(entries)) {
		const task = key.slice(0, key.indexOf(' '));
		const row = byTask.get(task) ?? {};
		row[verdict] = (row[verdict] ?? 0) + 1;
		byTask.set(task, row);
	}
	const rows = [...byTask].sort(([a], [b]) => a.localeCompare(b)).map(([task, verdicts]) => ({ task, verdicts }));
	return { units: Object.keys(entries).length, rows };
}

/** The commit the quoted code comes from, or `null` when crates/ differs from it. */
function revision(root: string): { rev: string; clean: boolean } {
	const rev = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
	const status = execFileSync('git', ['-C', root, 'status', '--porcelain', '--', 'crates'], { encoding: 'utf8' });
	return { rev, clean: status.trim() === '' };
}

export function rsvelteSource(): Plugin {
	const cratesDir = path.resolve(import.meta.dirname, '../../../../../crates');
	let highlighter: Promise<Highlighter> | undefined;
	return {
		name: 'rsvelte-source',
		resolveId(id) {
			return id === VIRTUAL ? RESOLVED : undefined;
		},
		async load(id) {
			if (id !== RESOLVED) return;
			highlighter ??= createHighlighter({
				themes: [theme],
				langs: ['rust', 'typescript', 'svelte', 'json', 'shellscript']
			});
			const h = await highlighter;
			const modules: HighlightedModule[] = sources(cratesDir).map(({ key, file }) => {
				const full = path.join(cratesDir, file);
				this.addWatchFile(full);
				const m: RustModule = parseRustModule(key, `crates/${file}`, readFileSync(full, 'utf8'));
				return {
					...m,
					items: m.items.map((it) => ({ ...it, markup: highlight(h, it.code, 'rust') }))
				};
			});
			const root = path.dirname(cratesDir);
			const { rev, clean } = revision(root);
			const baselineFile = path.join(root, 'tools/performance/baseline.json');
			const parityFile = path.join(root, 'fixtures/_registry/parity.json');
			this.addWatchFile(baselineFile);
			this.addWatchFile(parityFile);
			return [
				`export const modules = ${JSON.stringify(modules)};`,
				`export const rev = ${JSON.stringify(rev)};`,
				`export const clean = ${clean};`,
				`export const crates = ${JSON.stringify(crateSizes(cratesDir))};`,
				`export const performanceBaseline = ${JSON.stringify(readBaseline(baselineFile))};`,
				`export const performanceHistory = ${JSON.stringify(performanceHistory(root))};`,
				`export const parity = ${JSON.stringify(paritySummary(JSON.parse(readFileSync(parityFile, 'utf8'))))};`
			].join('\n');
		}
	};
}
