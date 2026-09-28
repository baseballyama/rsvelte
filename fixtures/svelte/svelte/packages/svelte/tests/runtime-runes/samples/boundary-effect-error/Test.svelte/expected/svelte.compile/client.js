import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		throw new Error('boom');
	});

	$.pop();
}