// Every input language the fixture set knows. A language decides which files it claims and whether
// a claimed file is admitted; tasks (./tasks) decide what is measured on an admitted unit.
// Adding Vue, HTML, CSS, … means adding an entry here (and tasks that apply to it), nothing else.
import { compile, compileModule } from 'svelte/compiler';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { toSvelte } from './svue.ts';
import { vueModule } from './behaviour/official.ts';
import type { Language } from './types.ts';

const code = (e: unknown): string => (e as { code?: string }).code ?? 'throw';

export const LANGUAGES: Language[] = [
	{
		id: 'svelte',
		family: 'svelte',
		ext: '.svelte',
		matches: (p) => p.endsWith('.svelte'),
		admit(src, filename) {
			// Every admitted component is measured in runes mode; `inferredMode` keeps what the
			// oracle would have chosen without `runes: true` so the neutral subset stays separable.
			try {
				compile(src, { filename, generate: false, runes: true });
			} catch (e) {
				return { include: false, reason: `not-runes-compatible:${code(e)}` };
			}
			let inferredMode = 'neutral';
			try {
				if (compile(src, { filename, generate: false }).metadata.runes) inferredMode = 'runes';
			} catch {}
			return { include: true, fields: { mode: 'runes', inferredMode } };
		}
	},
	{
		id: 'svelte-module-js',
		family: 'svelte',
		ext: '.svelte.js',
		matches: (p) => /\.svelte\.js$/.test(p),
		admit(src, filename) {
			try {
				compileModule(src, { filename, generate: false });
			} catch (e) {
				return { include: false, reason: `module-rejected:${code(e)}` };
			}
			return { include: true, fields: { mode: 'runes' } };
		}
	},
	{
		// No compile task yet: upstream only sees these after Vite strips the types, and which
		// stripper is the oracle is undecided (docs/fixtures.md). Parse/lint/fmt tasks still apply.
		id: 'svelte-module-ts',
		family: 'svelte',
		ext: '.svelte.ts',
		matches: (p) => /\.svelte\.ts$/.test(p),
		admit: () => ({ include: true, fields: { mode: 'runes' } })
	},
	{
		id: 'vue',
		family: 'vue',
		ext: '.vue',
		matches: (p) => p.endsWith('.vue'),
		admit(src, filename) {
			const { descriptor, errors } = parseSfc(src, { filename });
			if (errors.length) return { include: false, reason: `sfc-parse-error` };
			// `setup`: `<script setup>`; `options`: a plain `<script>` only; `template`: no script.
			const mode = descriptor.scriptSetup ? 'setup' : descriptor.script ? 'options' : 'template';
			return { include: true, fields: { mode } };
		}
	},
	{
		// Vue's template syntax with Svelte's semantics (./svue.ts): admitted when the rewrite to
		// Svelte syntax exists and the Svelte compiler accepts it.
		id: 'svue',
		family: 'svue',
		ext: '.svue',
		matches: (p) => p.endsWith('.svue'),
		admit(src, filename) {
			let svelte: string;
			try {
				svelte = toSvelte(src, filename);
			} catch {
				return { include: false, reason: 'no-svelte-rewrite' };
			}
			try {
				compile(svelte, { filename, generate: false, runes: true });
			} catch (e) {
				return { include: false, reason: `svelte-rejected:${code(e)}` };
			}
			return { include: true, fields: { mode: 'runes' } };
		}
	},
	{
		// A `.vue` component whose behaviour is the subject (svue.behaviour): it must build with the
		// official toolchain for both targets, since that build is the expected side.
		id: 'cross-vue',
		family: 'cross',
		ext: '.vue',
		matches: (p) => p.endsWith('.vue'),
		admit(src, filename) {
			try {
				for (const target of ['client', 'server'] as const) vueModule(src, filename, target);
			} catch {
				return { include: false, reason: 'vue-build-failed' };
			}
			const { descriptor } = parseSfc(src, { filename });
			return { include: true, fields: { mode: descriptor.scriptSetup ? 'setup' : descriptor.script ? 'options' : 'template' } };
		}
	},
	{
		// A `.svelte` component whose behaviour is the subject (vuelte.behaviour).
		id: 'cross-svelte',
		family: 'cross',
		ext: '.svelte',
		matches: (p) => p.endsWith('.svelte'),
		admit(src, filename) {
			try {
				compile(src, { filename, generate: false, runes: true });
			} catch (e) {
				return { include: false, reason: `not-runes-compatible:${code(e)}` };
			}
			return { include: true, fields: { mode: 'runes' } };
		}
	}
];

export const FAMILIES: string[] = [...new Set(LANGUAGES.map((l) => l.family))];

/** The language claiming `path`: the first that matches, or within `family` when one is given. */
export function languageOf(path: string, family?: string): Language | null {
	return LANGUAGES.find((l) => (family === undefined || l.family === family) && l.matches(path)) ?? null;
}

export function languageById(id: string): Language {
	const l = LANGUAGES.find((l) => l.id === id);
	if (!l) throw new Error(`unknown language ${id}`);
	return l;
}
