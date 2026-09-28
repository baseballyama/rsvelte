import * as $ from 'svelte/internal/server';
import { motion } from '$lib/Stores';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

export default function Loader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let mounted = false;

		onMount(() => {
			mounted = true;
		});

		if (mounted) {
			$$renderer.push(`<!--[0--><div class="svelte-1e75gt5"><svg viewBox="0 0 50 50" class="svelte-1e75gt5"><circle cx="25" cy="25" r="20" class="svelte-1e75gt5"></circle></svg></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}