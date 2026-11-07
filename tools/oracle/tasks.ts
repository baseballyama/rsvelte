// A task is one measured behaviour: an oracle run over a unit, producing named artifacts, each with a
// comparator. Linting, formatting, type checking, parsing, Vue or Tailwind land as new tasks here.
import { svueCompile, vuelteCompile } from './tasks/behaviour.ts';
import svelteCheck from './tasks/svelte-check.ts';
import svelteCompile from './tasks/svelte-compile.ts';
import svelteCompileModule from './tasks/svelte-compile-module.ts';
import svelteFormat from './tasks/svelte-format.ts';
import svelteLint from './tasks/svelte-lint.ts';
import tsCheck from './tasks/ts-check.ts';
import vueCheck from './tasks/vue-check.ts';
import vueCompile from './tasks/vue-compile.ts';
import vueFormat from './tasks/vue-format.ts';
import vueLint from './tasks/vue-lint.ts';
import type { Task } from './types.ts';

export const TASKS: Task[] = [
	svelteCheck,
	svelteCompile,
	svelteCompileModule,
	svelteFormat,
	svelteLint,
	svueCompile,
	tsCheck,
	vueCheck,
	vueCompile,
	vueFormat,
	vueLint,
	vuelteCompile,
];

export function taskById(id: string): Task {
	const task = TASKS.find((t) => t.id === id);
	if (!task) throw new Error(`unknown task ${id}; known: ${TASKS.map((t) => t.id).join(', ')}`);
	return task;
}
