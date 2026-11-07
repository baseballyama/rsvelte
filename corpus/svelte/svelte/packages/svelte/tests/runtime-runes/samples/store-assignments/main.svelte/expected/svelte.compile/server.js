import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);

		$.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) + 1);
		$.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) + 1);
		$.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) + 1);
		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$count', count))}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}