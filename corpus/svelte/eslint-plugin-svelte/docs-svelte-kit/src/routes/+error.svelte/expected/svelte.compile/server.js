import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { page } from '$app/stores';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<h1>${$.escape($.store_get($$store_subs ??= {}, '$page', page).status)}</h1> <blockquote><p>${$.escape($.store_get($$store_subs ??= {}, '$page', page).error.message)}</p> <p>Take me <a${$.attr('href', resolve('/'))}>home</a></p></blockquote>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}