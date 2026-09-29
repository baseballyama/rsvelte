import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		idx: 'kernel/idx/Idx',
		newtype: 'kernel/idx/newtype_index!',
		indexVec: 'kernel/idx/IndexVec',
		fromElem: 'kernel/idx/IndexVec::from_elem_n',
		resolution: 'svelte/resolve/Resolution',
		resolve: 'svelte/resolve/resolve',
		bindKind: 'svelte/resolve/BindKind',
		hir: 'svelte/hir/Hir',
		attrValue: 'svelte/hir/AttrValue',
		elementKind: 'svelte/hir/Builder::element_kind',
		list: 'svelte/hir/Builder::list',
		findings: 'kernel/lint/impl Findings',
		lint: 'svelte/lint/lint',
		button: 'svelte/lint/ButtonHasType::check'
	})
});
