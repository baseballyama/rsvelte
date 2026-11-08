import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	code: excerpts({
		parse: 'svelte/syntax/parse/parse',
		parsed: 'svelte/parser/computation/impl Artifact for Parsed',
		count: 'svelte/example_plugin/src/lib/impl Artifact for ElementCount',
		task: 'svelte/example_plugin/src/lib/impl Task for CountElements',
		plugin: 'svelte/example_plugin/src/lib/PLUGIN',
		register: 'svelte/example_plugin/src/lib/register',
		extension: 'svelte/example_plugin/src/lib/EXTENSION',
		host: 'svelte/example_plugin/examples/host/main',
		svelteRegister: 'svelte/computation/register',
		svelteTasks: 'svelte/typecheck/registration/register',
		resolved: 'svelte/computation/impl Artifact for Resolved',
	}),
});
