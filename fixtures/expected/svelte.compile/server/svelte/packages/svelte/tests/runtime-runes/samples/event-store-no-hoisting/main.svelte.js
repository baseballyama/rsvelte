import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = void 0;

		function setStore() {
			store = writable(0, () => {
				return () => {};
			});
		}

		$$renderer.push(`<button>set new store</button> <button>incr</button> <pre>${$.escape($.store_get($$store_subs ??= {}, '$store', store))}</pre>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}