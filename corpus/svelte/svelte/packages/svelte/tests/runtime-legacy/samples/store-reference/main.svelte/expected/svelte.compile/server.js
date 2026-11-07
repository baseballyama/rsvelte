import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable(0);

		$$renderer.push(`<button>clicks: ${$.escape($.store_get($$store_subs ??= {}, '$store', store))}</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}