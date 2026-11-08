import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	code: excerpts({
		parse: 'svelte/syntax/parse/parse',
		parsed: 'svelte/parser/computation/impl Artifact for Parsed',
		count: 'example_plugin/src/lib/impl Artifact for ElementCount',
		task: 'example_plugin/src/lib/impl Task for CountElements',
		plugin: 'example_plugin/src/lib/PLUGIN',
		register: 'example_plugin/src/lib/register',
		extension: 'example_plugin/src/lib/EXTENSION',
		host: 'example_plugin/examples/host/main',
		svelteRegister: 'svelte/computation/register',
		svelteTasks: 'svelte/typecheck/registration/register',
		resolved: 'svelte/computation/impl Artifact for Resolved',
	}),
});
