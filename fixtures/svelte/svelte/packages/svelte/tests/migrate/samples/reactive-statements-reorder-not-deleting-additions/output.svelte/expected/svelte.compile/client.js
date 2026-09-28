import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';
import { blah } from './blah.js';

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let bar = $.state(void 0);
	let foo = $.derived(() => $$props.data.foo);

	run(() => {
		$.set(bar, [], true);

		let baz;
	});

	$.pop();
}