import { arm, documents } from '$lib/server/benchmark';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	shared: arm('shared'),
	isolated: arm('isolated'),
	code: excerpts({
		artifact: 'kernel/computation/database/Artifact',
		parsed: 'svelte/parser/computation/impl Artifact for Parsed',
		scoped: 'svelte/compile/computation/impl Artifact for ScopedStylesheet',
		register: 'kernel/computation/database/ArtifactRegistry::register',
		slot: 'kernel/computation/database/ArtifactRegistry::slot',
		context: 'kernel/computation/database/DocumentContext',
		contextNew: 'kernel/computation/database/DocumentContext::new',
		get: 'kernel/computation/database/DocumentContext::get',
		lint: 'svelte/lint/task/Lint::run',
		compileInput: 'svelte/computation/component_input',
		facet: 'kernel/computation/database/Facet',
		provide: 'kernel/computation/database/ArtifactRegistry::provide',
		contextFacet: 'kernel/computation/database/DocumentContext::facet',
		typescriptView: 'typescript/check/check/TypeScriptView',
		typescriptDocument: 'typescript/check/check/TypeScriptDocument',
		svelteRegister: 'svelte/typecheck/registration/register',
		vueRegister: 'vue/check/registration/register',
		svelteView: 'svelte/typecheck/registration/typescript_view',
		prepare: 'typescript/check/check/Check::prepare'
	})
});
