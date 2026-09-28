import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const foo1 = 42;
	let foo2 = 42;

	var $$exports = {
		bar1: foo1,
		get bar2() {
			return foo2;
		},

		set bar2($$value) {
			foo2 = $$value;
		}
	};

	return $.pop($$exports);
}