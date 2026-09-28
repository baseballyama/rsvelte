import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

export default function Main($$anchor) {
	let foo;

	function onerror(err) {
		// re-throw if it isn't the production error
		// do in a such way because config.error is checked via `includes`
		if (err.message !== 'https://svelte.dev/e/props_invalid_value') {
			throw err;
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror }, ($$anchor) => {
		Child($$anchor, {
			get foo() {
				return foo;
			},

			set foo($$value) {
				foo = $$value;
			}
		});
	});

	$.append($$anchor, fragment);
}