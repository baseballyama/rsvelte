import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<div class="error svelte-1j96wlh"><h1 class="svelte-1j96wlh">${$.escape($.store_get($$store_subs ??= {}, '$page', page).status)}: ${$.escape($.store_get($$store_subs ??= {}, '$page', page)?.error?.message)}</h1></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}