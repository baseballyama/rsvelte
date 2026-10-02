import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const context = { store1: writable(31), store2: writable(42) };
		let store1;
		let store2;

		({ store1, store2 } = context);

		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store1', store1))}
${$.escape($.store_get($$store_subs ??= {}, '$store2', store2))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}