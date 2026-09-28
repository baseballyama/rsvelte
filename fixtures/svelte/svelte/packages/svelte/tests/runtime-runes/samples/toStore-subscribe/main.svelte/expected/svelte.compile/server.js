import * as $ from 'svelte/internal/server';
import { toStore } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let count = 0;
		const store = toStore(() => count, (v) => count = v);

		store.set(1);
		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store', store))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}