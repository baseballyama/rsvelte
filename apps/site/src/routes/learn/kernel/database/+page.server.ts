import { arm, documents } from '$lib/server/benchmark';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	shared: arm('shared'),
	isolated: arm('isolated'),
	code: excerpts({
		artifact: 'kernel/computation/database/Artifact',
		parsed: 'svelte/computation/impl Artifact for Parsed',
		scoped: 'svelte/computation/impl Artifact for ScopedStylesheet',
		register: 'kernel/computation/database/ArtifactRegistry::register',
		slot: 'kernel/computation/database/ArtifactRegistry::slot',
		context: 'kernel/computation/database/DocumentContext',
		contextNew: 'kernel/computation/database/DocumentContext::new',
		get: 'kernel/computation/database/DocumentContext::get',
		lint: 'svelte/computation/tasks/Lint::run',
		compileInput: 'svelte/computation/compile_input',
		facet: 'kernel/computation/database/Facet',
		provide: 'kernel/computation/database/ArtifactRegistry::provide',
		contextFacet: 'kernel/computation/database/DocumentContext::facet',
		typescriptView: 'javascript/check/TypeScriptView',
		typescriptDocument: 'javascript/check/TypeScriptDocument',
		svelteRegister: 'svelte/computation/tasks/register',
		vueRegister: 'vue/tasks/register',
		svelteView: 'svelte/computation/tasks/typescript_view',
		prepare: 'javascript/check/Check::prepare'
	})
});
