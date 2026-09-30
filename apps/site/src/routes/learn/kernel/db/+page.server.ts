import { arm, documents } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	shared: arm('shared'),
	isolated: arm('isolated'),
	code: excerpts({
		artifact: 'kernel/db/Artifact',
		parsed: 'svelte/lib/impl Artifact for Parsed',
		scoped: 'svelte/lib/impl Artifact for ScopedCss',
		register: 'kernel/db/ArtifactRegistry::register',
		slot: 'kernel/db/ArtifactRegistry::slot',
		ctx: 'kernel/db/Ctx',
		ctxNew: 'kernel/db/Ctx::new',
		get: 'kernel/db/Ctx::get',
		lint: 'svelte/tasks/Lint::run',
		compileInput: 'svelte/lib/compile_input',
		facet: 'kernel/db/Facet',
		provide: 'kernel/db/ArtifactRegistry::provide',
		ctxFacet: 'kernel/db/Ctx::facet',
		tsView: 'js/check/TsView',
		tsDoc: 'js/check/TsDoc',
		svelteRegister: 'svelte/tasks/register',
		vueRegister: 'vue/tasks/register',
		svelteView: 'svelte/tasks/ts_view',
		prepare: 'js/check/Check::prepare'
	})
});
