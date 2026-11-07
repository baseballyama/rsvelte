import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Spread01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable([42]);
		const constStore = writable(['hello']);

		console.log(...$.store_get($$store_subs ??= {}, '$store', store));
		console.log(...$.store_get($$store_subs ??= {}, '$constStore', constStore));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}