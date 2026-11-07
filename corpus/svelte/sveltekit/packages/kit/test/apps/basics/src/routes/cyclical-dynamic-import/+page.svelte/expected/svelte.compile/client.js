import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		const { is_even } = await import('./_is_even.js');

		console.log(is_even(5));
	});

	$.pop();
}