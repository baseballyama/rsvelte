import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	code: excerpts({
		parse: 'svelte/syntax/parse/parse',
		parsed: 'svelte/syntax/computation/impl Artifact for Parsed',
		count: 'example_plugin/src/lib/impl Artifact for ElementCount',
		task: 'example_plugin/src/lib/impl Task for CountElements',
		plugin: 'example_plugin/src/lib/PLUGIN',
		register: 'example_plugin/src/lib/register',
		extension: 'example_plugin/src/lib/EXTENSION',
		host: 'example_plugin/examples/host/main',
		svelteRegister: 'svelte/semantic/computation/register',
		svelteTasks: 'svelte/check/registration/register',
		resolved: 'svelte/semantic/computation/impl Artifact for Resolved',
	}),
});
