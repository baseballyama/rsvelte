import * as $ from 'svelte/internal/server';
import { showACLPagesStore } from '$lib/common/stores';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		//
		// Imports
		//
		// Set to true once component is initialized
		let componentLoaded = false;

		onMount(async () => {
			componentLoaded = true;
		});

		$$renderer.push(`<body>`);

		if (showACLPagesStore) {
			$$renderer.push(`<!--[0--><div${$.attr('hidden', !componentLoaded)} class="px-4 py-4 w-4/5 max-w-screen-lg"><h1 class="text-2xl bold text-primary">Group View</h1></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></body>`);
	});
}