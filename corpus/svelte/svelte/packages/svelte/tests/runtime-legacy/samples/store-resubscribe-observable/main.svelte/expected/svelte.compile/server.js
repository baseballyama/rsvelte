import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function fake_observable(store) {
			return { subscribe: (cb) => ({ unsubscribe: store.subscribe(cb) }) };
		}

		let foo = fake_observable(writable(0));

		foo = fake_observable(writable(42));
		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$foo', foo))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}