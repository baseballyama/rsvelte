import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function _error($$renderer) {
	$.head('hcvrai', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Error</title>`);
		});
	});

	$$renderer.push(`<h1 class="svelte-hcvrai">Page not found!</h1> <a${$.attr('href', `${$.stringify(base)}/`)} class="svelte-hcvrai">Go to start page</a>`);
}