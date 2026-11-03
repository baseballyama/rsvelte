import svelteCheck from './svelte-check.ts';
import vueCheck from './vue-check.ts';
import type { Task } from '../types.ts';

// rsvelte's language-neutral type check: one tsc over the documents of every language. Its oracle is
// each language's own checker on the unit (svelte-check for a component, vue-tsc for an SFC), so
// checking the languages together must change nothing.
const task: Task = {
	id: 'ts.check',
	storage: 'committed',
	oracles: [...new Set([...svelteCheck.oracles, ...vueCheck.oracles])],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => svelteCheck.appliesTo(unit) || vueCheck.appliesTo(unit),
	run: (unit, src, variant) => (unit.lang === 'svelte' ? svelteCheck : vueCheck).run(unit, src, variant)
};
export default task;
