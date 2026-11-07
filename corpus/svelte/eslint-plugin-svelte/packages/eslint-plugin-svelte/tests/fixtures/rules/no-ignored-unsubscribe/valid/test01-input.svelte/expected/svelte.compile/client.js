import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Test01_input($$anchor, $$props) {
	$.push($$props, true);

	const foo = writable(0);

	const unsubscribe = foo.subscribe(() => {
		console.log('foo changed');
	});

	$.pop();
}