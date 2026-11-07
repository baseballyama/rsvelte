import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const title = $.derived(() => `${page.status}: ${page.error?.message}`);

		$$renderer.push(`<h1>${$.escape(title())}</h1>`);
	});
}