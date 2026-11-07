import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let something = '123';
	let foo = $.state(false);

	run(() => {
		$.set(foo, !!something);
	});

	$.pop();
}