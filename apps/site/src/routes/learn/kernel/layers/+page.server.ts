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
		list: 'svelte/compilation/normalize/SurfaceBuilder::list',
		compilerSyntaxTreeBuilder: 'svelte/compilation/compiler_syntax_tree/CompilerSyntaxTreeBuilder',
		compileInputType: 'svelte/computation/svelte_input',
		svueRegister: 'svue/computation/register',
		svueTranslated: 'svue/computation/impl Artifact for Translated',
		svueInput: 'svue/compilation/Translation::compile_input',
		svueClass: 'svue/compilation/template/attributes/T::dynamic_class',
		vuelteRegister: 'vuelte/computation/register',
		vuelteModule: 'vuelte/computation/Compile::module',
		vuelteRef: 'vuelte/compilation/template/elements/Builder::ref_function',
		vuelteBindText: 'vuelte/compilation/template/bindings/Builder::bind_text',
		buttonType: 'markup/button_type/check_static',
		vueButton: 'vue/lint/lint/MarkupButtonHasType::check',
		tokensDefault: 'kernel/source/tokens/impl Default for Tokens',
		findings: 'kernel/diagnostics/rules/impl Findings',
		lint: 'svelte/lint/lint/lint',
		button: 'svelte/lint/lint/ButtonHasType::check'
	})
});
