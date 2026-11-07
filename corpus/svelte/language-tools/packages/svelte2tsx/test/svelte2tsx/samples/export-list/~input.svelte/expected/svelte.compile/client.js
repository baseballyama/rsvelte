import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

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

	var $$exports = {
		get name1() {
			return name1;
		},

		set name1($$value) {
			name1 = $$value;
		},

		get name2() {
			return name2;
		},

		set name2($$value) {
			name2 = $$value;
		},

		get renamed1() {
			return rename1;
		},

		set renamed1($$value) {
			rename1 = $$value;
		},

		get renamed2() {
			return rename2;
		},

		set renamed2($$value) {
			rename2 = $$value;
		},

		get Foo() {
			return Foo;
		},

		set Foo($$value) {
			Foo = $$value;
		},
		bar,
		baz,
		get RenamedFoo() {
			return RenameFoo;
		},

		set RenamedFoo($$value) {
			RenameFoo = $$value;
		},
		renamedbar: renamebar,
		renamedbaz: renamebaz
	};

	return $.pop($$exports);
}