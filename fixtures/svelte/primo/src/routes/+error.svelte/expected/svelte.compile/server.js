import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="placeholder svelte-1j96wlh">${$.escape(page.error?.message)}</div>`);
	});
}