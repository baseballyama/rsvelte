import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';

export default function Empty($$anchor, $$props) {
	$.push($$props, true);

	onDestroy(() => {
		console.log('destroy');
	});

	$.pop();
}