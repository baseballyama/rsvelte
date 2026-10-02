import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { error } = $$props;

		$.head('1ujoa4n', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Custom error page: ${$.escape(error.message)}</title>`);
			});
		});

		$$renderer.push(`<h1 class="svelte-1ujoa4n">${$.escape(page.status)}</h1> <p id="message" class="svelte-1ujoa4n">This is your custom error page saying: "<b>${$.escape(error.message)}</b>"</p> <a id="error-home" href="/">home</a>`);
	});
}