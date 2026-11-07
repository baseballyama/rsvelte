import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
		const title = offline ? 'Offline' : page.status;

		const message = offline
			? 'Find the internet and try again'
			: page.error?.message;

		$.head('1oilzc3', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(title)}</title>`);
			});
		});

		$$renderer.push(`<h1 class="svelte-1oilzc3">${$.escape(title)}</h1> <pre>${$.escape(message)}</pre>`);
	});
}