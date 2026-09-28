// A task is one measured behaviour: an oracle run over a unit, producing named artifacts, each with a
// comparator. Linting, formatting, type checking, parsing, Vue or Tailwind land as new tasks here.
import svelteCompile from './svelte-compile.ts';
import svelteCompileModule from './svelte-compile-module.ts';
import type { Task } from '../types.ts';

export const TASKS: Task[] = [svelteCompile, svelteCompileModule];

export function taskById(id: string): Task {
	const t = TASKS.find((t) => t.id === id);
	if (!t) throw new Error(`unknown task ${id}; known: ${TASKS.map((t) => t.id).join(', ')}`);
	return t;
}
