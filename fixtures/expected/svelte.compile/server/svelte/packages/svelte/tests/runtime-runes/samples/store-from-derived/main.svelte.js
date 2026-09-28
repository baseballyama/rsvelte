import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let data = { store: writable(false) };
		let store = $.derived(() => data.store);

		$$renderer.push(`<button>${$.escape($.store_get($$store_subs ??= {}, '$store', store()))}</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}