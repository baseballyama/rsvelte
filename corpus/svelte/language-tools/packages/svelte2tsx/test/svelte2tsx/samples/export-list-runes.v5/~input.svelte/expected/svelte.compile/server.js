import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let name1 = "world";
	let name2;
	let rename1 = '';
	let rename2;

	class Foo {}

	function bar() {}

	const baz = '';

	class RenameFoo {}

	function renamebar() {}

	const renamebaz = '';

	$.bind_props($$props, {
		name1,
		name2,
		renamed1: rename1,
		renamed2: rename2,
		Foo,
		bar,
		baz,
		RenamedFoo: RenameFoo,
		renamedbar: renamebar,
		renamedbaz: renamebaz
	});
}