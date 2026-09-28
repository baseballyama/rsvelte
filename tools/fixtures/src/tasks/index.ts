// A task is one measured behaviour: an oracle run over a unit, producing named artifacts, each with a
// comparator. Linting, formatting, type checking, parsing, Vue or Tailwind land as new tasks here.
import svelteCheck from './svelte-check.ts';
import svelteCompile from './svelte-compile.ts';
import svelteCompileModule from './svelte-compile-module.ts';
import svelteFormat from './svelte-format.ts';
import svelteLint from './svelte-lint.ts';
import type { Task } from '../types.ts';

export const TASKS: Task[] = [svelteCheck, svelteCompile, svelteCompileModule, svelteFormat, svelteLint];

export function taskById(id: string): Task {
	const t = TASKS.find((t) => t.id === id);
	if (!t) throw new Error(`unknown task ${id}; known: ${TASKS.map((t) => t.id).join(', ')}`);
	return t;
}
