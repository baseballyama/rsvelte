import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component_with_getters($$anchor, $$props) {
	$.push($$props, true);

	function test() {
		return 1;
	}

	class Foo {}

	const bar = true;

	var $$exports = {
		test,
		get Foo() {
			return Foo;
		},

		set Foo($$value) {
			Foo = $$value;
		},
		bar
	};

	return $.pop($$exports);
}