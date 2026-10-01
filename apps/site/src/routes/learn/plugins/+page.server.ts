import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		parse: 'svelte/syntax/parse/parse',
		parsed: 'svelte/computation/impl Artifact for Parsed',
		count: 'svelte/examples/plugin/impl Artifact for ElementCount',
		task: 'svelte/examples/plugin/impl Task for CountElements',
		register: 'svelte/examples/plugin/register',
		host: 'svelte/examples/plugin/main',
		svelteRegister: 'svelte/computation/register',
		svelteTasks: 'svelte/computation/tasks/register',
		resolved: 'svelte/computation/impl Artifact for Resolved'
	})
});
