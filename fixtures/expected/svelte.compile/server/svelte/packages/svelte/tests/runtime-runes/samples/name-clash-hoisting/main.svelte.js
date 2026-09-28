import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = writable(0);

		async function logStore() {
			console.log($.store_get($$store_subs ??= {}, '$store', store));
			store.set(100);
		}

		$$renderer.push(`<button>Click me</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}