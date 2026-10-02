import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let foo = writable(0);

		foo = writable(42);
		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$foo', foo))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}