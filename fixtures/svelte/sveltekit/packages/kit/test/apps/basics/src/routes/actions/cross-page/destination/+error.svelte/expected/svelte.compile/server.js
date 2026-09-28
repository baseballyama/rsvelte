import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1 class="destination-error">destination error: ${$.escape(page.error?.message)}</h1>`);
	});
}