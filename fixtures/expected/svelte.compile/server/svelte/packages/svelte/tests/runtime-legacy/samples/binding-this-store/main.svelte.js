import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const foo = writable();

		$$renderer.push(`<div>${$.escape(typeof $.store_get($$store_subs ??= {}, '$foo', foo))}</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}