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
		index: 'kernel/source/index/TypedIndex',
		newtype: 'kernel/source/index/newtype_index!',
		indexVec: 'kernel/source/index/IndexVector',
		fromElem: 'kernel/source/index/IndexVector::from_element_n',
		lossless: 'kernel/source/tokens/Tokens::check_lossless',
		before: 'kernel/source/tokens/Tokens::before',
		tk: 'svelte/syntax/syntax_tree/TokenType',
		resolution: 'svelte/semantic/resolve/Resolution',
		resolve: 'svelte/semantic/resolve/resolve',
		bindKind: 'svelte/semantic/resolve/BindingKind',
		compiler_syntax_tree: 'svelte/compilation/compiler_syntax_tree/CompilerSyntaxTree',
		attributeValue: 'svelte/compilation/compiler_syntax_tree/AttributeValue',
		elementKind: 'svelte/compilation/compiler_syntax_tree/CompilerSyntaxTreeBuilder::element_kind',
		list: 'svelte/compilation/compiler_syntax_tree/SurfaceBuilder::list',
		compilerSyntaxTreeBuilder: 'svelte/compilation/compiler_syntax_tree/CompilerSyntaxTreeBuilder',
		compileInputType: 'svelte/computation/svelte_input',
		svueFrontend: 'svue/lib/impl Artifact for Frontend',
		svueResolved: 'svue/lib/impl Artifact for Resolved',
		svueBuild: 'svue/frontend/build',
		svueRegister: 'svue/lib/register',
		buttonType: 'markup/button_type/check_static',
		vueButton: 'vue/lint/MarkupButtonHasType::check',
		tokensDefault: 'kernel/source/tokens/impl Default for Tokens',
		findings: 'kernel/diagnostics/rules/impl Findings',
		lint: 'svelte/tooling/lint/lint',
		button: 'svelte/tooling/lint/ButtonHasType::check'
	})
});
