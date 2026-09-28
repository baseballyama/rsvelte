// Every input language the fixture set knows. A language decides which files it claims and whether
// a claimed file is admitted; tasks (./tasks) decide what is measured on an admitted unit.
// Adding Vue, HTML, CSS, … means adding an entry here (and tasks that apply to it), nothing else.
import { compile, compileModule } from 'svelte/compiler';
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
	}
];

export const FAMILIES: string[] = [...new Set(LANGUAGES.map((l) => l.family))];

export function languageOf(path: string): Language | null {
	return LANGUAGES.find((l) => l.matches(path)) ?? null;
}

export function languageById(id: string): Language {
	const l = LANGUAGES.find((l) => l.id === id);
	if (!l) throw new Error(`unknown language ${id}`);
	return l;
}
