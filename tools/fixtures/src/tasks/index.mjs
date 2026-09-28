// A task is one measured behaviour: an oracle run over a unit, producing named artifacts, each with a
// comparator. Linting, formatting, type checking, parsing, Vue or Tailwind land as new tasks here.
//
// @typedef {{ text: string, ext: string, compare: 'js-ast' | 'text' | 'json' }} Artifact
// @typedef {{
//   id: string,
//   storage: 'committed' | 'cached',   // cached: regenerated into fixtures/.cache, never in git
//   oracles: string[],                 // npm packages whose version the output depends on
//   variants: { id: string, options: Record<string, unknown> }[],
//   appliesTo: (unit) => boolean,
//   run: (unit, src: string, variant) => Record<string, Artifact>,
// }} Task
import svelteCompile from './svelte-compile.mjs';
import svelteCompileModule from './svelte-compile-module.mjs';

export const TASKS = [svelteCompile, svelteCompileModule];

export function taskById(id) {
	const t = TASKS.find((t) => t.id === id);
	if (!t) throw new Error(`unknown task ${id}; known: ${TASKS.map((t) => t.id).join(', ')}`);
	return t;
}
