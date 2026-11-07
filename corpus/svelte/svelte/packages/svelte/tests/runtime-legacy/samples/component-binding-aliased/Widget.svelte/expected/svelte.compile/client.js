import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Widget($$anchor, $$props) {
	$.push($$props, true);

	let foo = 42;

	var $$exports = {
		get bar() {
			return foo;
		},

		set bar($$value) {
			foo = $$value;
		}
	};

	return $.pop($$exports);
}