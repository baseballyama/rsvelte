import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

export default function Wrapper($$anchor) {
	let bar = $.state(void 0);

	Foo($$anchor, {
		get bar() {
			return $.get(bar);
		},

		set bar($$value) {
			$.set(bar, $$value, true);
		}
	});
}