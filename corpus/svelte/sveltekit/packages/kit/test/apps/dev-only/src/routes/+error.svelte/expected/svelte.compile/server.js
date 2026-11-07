import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<pre>${$.escape(page.error?.message)}</pre>`);
	});
}