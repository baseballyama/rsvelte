import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	class Foo {}

	var $$exports = {
		get Foo() {
			return Foo;
		},

		set Foo($$value) {
			Foo = $$value;
		}
	};

	return $.pop($$exports);
}