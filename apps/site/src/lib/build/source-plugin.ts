// `virtual:rsvelte-source`: the Rust modules the site explains, split into items and highlighted at
// build time. Pages quote code by item key; a key that no longer exists fails the build instead of
// showing stale code. Highlighting here keeps the Worker's per-request CPU at rendering only.

import { performanceHistory } from './performance-history.ts';
import { execFileSync } from 'node:child_process';
import fs, { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
	createCssVariablesTheme as createStylesheetVariablesTheme,
	createHighlighter,
	type Highlighter,
} from 'shiki';
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
	const phases = Object.fromEntries(
		Object.entries(record.phases).map(([name, phase]) => {
			const { allocs: phaseAllocations, ...phaseFields } = phase;
			return [name, { ...phaseFields, allocations: phaseAllocations }];
		}),
	);
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
const theme = createStylesheetVariablesTheme({
	name: 'rsvelte',
	variablePrefix: '--shiki-',
	fontStyle: true,
});

function highlight(h: Highlighter, code: string, lang: string): string {
	return h.codeToHtml(code, { lang, theme: 'rsvelte' });
}

export interface CrateSize {
	name: string;
	files: number;
	/** Lines of Rust under src/, tests included. */
	lines: number;
}

export function crateSizes(cratesDir: string): CrateSize[] {
	const metadata = JSON.parse(
		execFileSync('cargo', ['metadata', '--offline', '--no-deps', '--format-version', '1'], {
			cwd: path.dirname(cratesDir),
			encoding: 'utf8',
		}),
	) as {
		packages: { id: string; name: string; manifest_path: string }[];
		workspace_members: string[];
	};
	const members = new Set(metadata.workspace_members);
	return metadata.packages
		.filter((entry) => members.has(entry.id))
		.map((entry) => {
			const sourceDir = path.resolve(path.dirname(entry.manifest_path), 'src');
			const files = readdirSync(sourceDir, { recursive: true, encoding: 'utf8' }).filter((f) =>
				f.endsWith('.rs'),
			);
			const lines = files.reduce(
				(n, f) => n + readFileSync(path.resolve(sourceDir, f), 'utf8').split('\n').length - 1,
				0,
			);
			return { name: entry.name, files: files.length, lines };
		})
		.toSorted((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

interface ParityRow {
	task: string;
	verdicts: Record<string, number>;
}

/**
 * The parity ledger, corpus/_registry/parity/<task>/<variant>.txt, counted per task and verdict:
 * its header counts the matches and each other line is `<unit>\t<verdict>`.
 */
function paritySummary(dir: string): { units: number; rows: ParityRow[]; files: string[] } {
	const files = fs
		.readdirSync(dir, { recursive: true, encoding: 'utf8' })
		.filter((f) => f.endsWith('.txt'))
		.map((f) => path.join(dir, f))
		.toSorted();
	let units = 0;
	const rows = files.map((file) => {
		const [header = '', ...lines] = readFileSync(file, 'utf8').trimEnd().split('\n');
		const [, task = '', matched = '0'] = /^# (.+): (\d+) match$/.exec(header) ?? [];
		const verdicts: Record<string, number> = { match: Number(matched) };
		for (const line of lines) {
			const verdict = line.slice(line.lastIndexOf('\t') + 1);
			verdicts[verdict] = (verdicts[verdict] ?? 0) + 1;
		}
		units += Number(matched) + lines.length;
		return { task, verdicts };
	});
	return { units, rows, files };
}

/** The commit the quoted code comes from, and whether the quoted files still match it. */
function revision(root: string, files: string[]): { rev: string; clean: boolean } {
	const rev = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
	// Naming the files keeps Git from walking the ignored test output under crates/, which takes minutes on a busy machine.
	const status = execFileSync('git', ['-C', root, 'status', '--porcelain', '--', ...files], {
		encoding: 'utf8',
	});
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
				langs: ['rust', 'typescript', 'svelte', 'json', 'shellscript'],
			});
			const h = await highlighter;
			const modules: HighlightedModule[] = sources(cratesDir).map(({ key, file }) => {
				const full = path.join(cratesDir, file);
				this.addWatchFile(full);
				const m: RustModule = parseRustModule(
					key,
					path.posix.join('crates', file),
					readFileSync(full, 'utf8'),
				);
				return Object.assign(m, {
					items: m.items.map((it) => Object.assign(it, { markup: highlight(h, it.code, 'rust') })),
				});
			});
			const root = path.dirname(cratesDir);
			const { rev, clean } = revision(
				root,
				modules.map((m) => m.path),
			);
			const baselineFile = path.join(root, 'tools/performance/baseline.json');
			const parity = paritySummary(path.join(root, 'corpus/_registry/parity'));
			this.addWatchFile(baselineFile);
			for (const file of parity.files) this.addWatchFile(file);
			return [
				`export const modules = ${JSON.stringify(modules)};`,
				`export const rev = ${JSON.stringify(rev)};`,
				`export const clean = ${clean};`,
				`export const crates = ${JSON.stringify(crateSizes(cratesDir))};`,
				`export const performanceBaseline = ${JSON.stringify(readBaseline(baselineFile))};`,
				`export const performanceHistory = ${JSON.stringify(performanceHistory(root))};`,
				`export const parity = ${JSON.stringify({ units: parity.units, rows: parity.rows })};`,
			].join('\n');
		},
	};
}
