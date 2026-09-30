import { allModules, excerpts } from '$lib/server/source';

/** Every `const _: () = assert!(size_of::<T>() == N, …)` in the quoted crates, read at build time. */
function layouts() {
	return allModules().flatMap((m) =>
		m.items
			.filter((it) => it.name.startsWith('_'))
			.flatMap((it) =>
				[...it.code.matchAll(/assert!\(\s*size_of::<([^()]+?)>\(\)\s*==\s*(\d+)/g)].map((x) => ({
					file: m.path.replace(/^crates\//, ''),
					type: x[1],
					bytes: Number(x[2])
				}))
			)
	);
}

export const load = () => ({
	layouts: layouts(),
	code: excerpts({
		idx: 'kernel/idx/Idx',
		newtype: 'kernel/idx/newtype_index!',
		indexVec: 'kernel/idx/IndexVec',
		fromElem: 'kernel/idx/IndexVec::from_elem_n',
		lossless: 'kernel/token/Tokens::check_lossless',
		before: 'kernel/token/Tokens::before',
		tk: 'svelte/ast/Tk',
		resolution: 'svelte/resolve/Resolution',
		resolve: 'svelte/resolve/resolve',
		bindKind: 'svelte/resolve/BindKind',
		hir: 'svelte/hir/Hir',
		attrValue: 'svelte/hir/AttrValue',
		elementKind: 'svelte/hir/HirBuilder::element_kind',
		list: 'svelte/hir/SurfaceBuilder::list',
		hirBuilder: 'svelte/hir/HirBuilder',
		compileInputType: 'svelte/lib/svelte_input',
		svueFrontend: 'svue/lib/impl Artifact for Frontend',
		svueResolved: 'svue/lib/impl Artifact for Resolved',
		svueBuild: 'svue/frontend/build',
		svueRegister: 'svue/lib/register',
		buttonType: 'html/button_type/check_static',
		vueButton: 'vue/lint/HtmlButtonHasType::check',
		tokensDefault: 'kernel/token/impl Default for Tokens',
		findings: 'kernel/lint/impl Findings',
		lint: 'svelte/lint/lint',
		button: 'svelte/lint/ButtonHasType::check'
	})
});
