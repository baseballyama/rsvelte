import * as $ from 'svelte/internal/server';
import { _ } from 'svelte-i18n';

export default function Ts_i18n_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<h1>${$.escape($.store_get($$store_subs ??= {}, '$_', _)('page.home.title'))}</h1>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}