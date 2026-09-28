import * as $ from 'svelte/internal/server';
import DevSettings from '$lib/settings/DevSettings.svelte';
import ServerSettings from '$lib/settings/ServerSettings.svelte';
import ThemeSettings from '$lib/settings/ThemeSettings.svelte';
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
			// Display component frontend
			await new Promise((r) => setTimeout(r, 200));

			componentLoaded = true;
		});

		$$renderer.push(`<body><div${$.attr('hidden', !componentLoaded)} class="px-4 py-4 w-4/5 max-w-screen-lg">`);
		ServerSettings($$renderer, {});
		$$renderer.push(`<!----> <div class="p-4"></div> `);
		ThemeSettings($$renderer, {});
		$$renderer.push(`<!----> <div class="p-4"></div> <h1 class="text-2xl bold text-primary mb-4">Version</h1> <b>insert-version</b> <div class="p-4"></div> `);
		DevSettings($$renderer, {});
		$$renderer.push(`<!----></div></body>`);
	});
}