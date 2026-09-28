// Every input language the fixture set knows. A language decides which files it claims and whether
// a claimed file is admitted; tasks (./tasks) decide what is measured on an admitted unit.
// Adding Vue, HTML, CSS, … means adding an entry here (and tasks that apply to it), nothing else.
import { compile, compileModule } from 'svelte/compiler';

/**
 * @typedef {{ include: true, fields?: Record<string, unknown> } | { include: false, reason: string }} Admission
 * @typedef {{ id: string, matches: (path: string) => boolean, admit: (src: string, path: string) => Admission }} Language
 */

/** @type {Language[]} */
export const LANGUAGES = [
	{
		id: 'svelte',
		matches: (p) => p.endsWith('.svelte'),
		admit(src, filename) {
			// Every admitted component is measured in runes mode; `inferredMode` keeps what the
			// oracle would have chosen without `runes: true` so the neutral subset stays separable.
			try {
				compile(src, { filename, generate: false, runes: true });
			} catch (e) {
				return { include: false, reason: `not-runes-compatible:${e.code ?? 'throw'}` };
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
		matches: (p) => /\.svelte\.js$/.test(p),
		admit(src, filename) {
			try {
				compileModule(src, { filename, generate: false });
			} catch (e) {
				return { include: false, reason: `module-rejected:${e.code ?? 'throw'}` };
			}
			return { include: true, fields: { mode: 'runes' } };
		}
	},
	{
		// No compile task yet: upstream only sees these after Vite strips the types, and which
		// stripper is the oracle is undecided (docs/fixtures.md). Parse/lint/fmt tasks still apply.
		id: 'svelte-module-ts',
		matches: (p) => /\.svelte\.ts$/.test(p),
		admit: () => ({ include: true, fields: { mode: 'runes' } })
	}
];

export function languageOf(path) {
	return LANGUAGES.find((l) => l.matches(path)) ?? null;
}
