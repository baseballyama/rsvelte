import * as $ from 'svelte/internal/server';
import { writable, fromStore } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = writable(0);
		const state_from_store = fromStore(store);

		const derived_value = $.derived(() => {
			if (state_from_store.current > 10) {
				return state_from_store.current;
			} else {
				return 10;
			}
		});

		function increment() {
			$.store_set(store, $.store_get($$store_subs ??= {}, '$store', store) + 1);
		}

		$$renderer.push(`<!---->${$.escape(state_from_store.current)} <button>Increment</button><br/> `);

		if (derived_value() > 10) {
			$$renderer.push(`<!--[0-->Exceeded 10!`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}