// `virtual:rsvelte-source`: the Rust modules the site explains, split into items and highlighted at
// build time. Pages quote code by item key; a key that no longer exists fails the build instead of
// showing stale code. Highlighting here keeps the Worker's per-request CPU at rendering only.

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';
import type { Plugin } from 'vite';
import { parseRustModule, type RustModule } from './rust-items.ts';

const VIRTUAL = 'virtual:rsvelte-source';
const RESOLVED = '\0' + VIRTUAL;

/** Short crate names used in item keys. */
const CRATES: Record<string, string> = {
	rsv_kernel: 'kernel',
	rsv_svelte: 'svelte',
	rsv_js: 'js',
	rsv_cli: 'cli'
};

/** Every kernel module, plus the plugin code the guide uses as worked examples. */
function sources(cratesDir: string): { key: string; file: string }[] {
	const kernel = readdirSync(path.join(cratesDir, 'rsv_kernel/src'))
		.filter((f) => f.endsWith('.rs'))
		.sort()
		.map((f) => ({ key: `kernel/${f.slice(0, -3)}`, file: `rsv_kernel/src/${f}` }));
	const examples = [
		'rsv_svelte/src/lib.rs',
		'rsv_svelte/src/tasks.rs',
		'rsv_svelte/src/lint.rs',
		'rsv_svelte/src/resolve.rs',
		'rsv_svelte/src/hir.rs',
		'rsv_svelte/src/project.rs',
		'rsv_js/src/lint.rs',
		'rsv_js/src/check.rs',
		'rsv_cli/src/bench.rs'
	].map((file) => {
		const [crate, , name] = file.split('/');
		return { key: `${CRATES[crate]}/${name.slice(0, -3)}`, file };
	});
	return [...kernel, ...examples];
}

export interface HighlightedItem {
	key: string;
	kind: string;
	name: string;
	startLine: number;
	endLine: number;
	docs: string;
	code: string;
	html: string;
}

export interface HighlightedModule {
	key: string;
	path: string;
	docs: string;
	lines: number;
	items: HighlightedItem[];
}

/** Token colours are CSS variables (`--shiki-token-*` in app.css), so one pass serves both themes. */
const theme = createCssVariablesTheme({ name: 'rsvelte', variablePrefix: '--shiki-', fontStyle: true });

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
					items: m.items.map((it) => ({ ...it, html: highlight(h, it.code, 'rust') }))
				};
			});
			const { rev, clean } = revision(path.dirname(cratesDir));
			return [
				`export const modules = ${JSON.stringify(modules)};`,
				`export const rev = ${JSON.stringify(rev)};`,
				`export const clean = ${clean};`,
				`export const crates = ${JSON.stringify(crateSizes(cratesDir))};`
			].join('\n');
		}
	};
}
