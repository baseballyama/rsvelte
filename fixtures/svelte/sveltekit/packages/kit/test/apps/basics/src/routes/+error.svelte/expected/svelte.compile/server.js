import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('1baasea', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Custom error page: ${$.escape(page.error?.message)}</title>`);
			});
		});

		$$renderer.push(`<h1 class="svelte-1baasea">${$.escape(page.status)}</h1> <p id="message" class="svelte-1baasea">This is your custom error page saying: "<b>${$.escape(page.error?.message)}</b>"</p>`);
	});
}