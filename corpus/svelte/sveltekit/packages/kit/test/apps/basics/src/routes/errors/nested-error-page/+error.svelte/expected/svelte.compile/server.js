import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1 class="svelte-1v3uynx">Nested error page</h1> <p id="nested-error-status">status: ${$.escape(page.status)}</p> <p id="nested-error-message">error.message: ${$.escape(page.error && page.error.message)}</p>`);
	});
}