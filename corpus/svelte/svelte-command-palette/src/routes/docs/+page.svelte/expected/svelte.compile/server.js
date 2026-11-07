import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			goto('/docs/installation');
		});

		$$renderer.push(`<div class="loading svelte-1xmjmrw"><div class="spinner svelte-1xmjmrw"></div> <p class="svelte-1xmjmrw">Loading documentation...</p></div>`);
	});
}