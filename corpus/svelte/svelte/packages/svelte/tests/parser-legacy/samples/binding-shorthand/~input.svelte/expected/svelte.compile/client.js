import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	let foo;

	Widget($$anchor, {
		get foo() {
			return foo;
		},

		set foo($$value) {
			foo = $$value;
		}
	});
}