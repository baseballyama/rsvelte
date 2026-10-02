import * as $ from 'svelte/internal/server';
import store from './store.js';

export default function Runes_with_store01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let count = 0;
		let doubled = $.derived(() => count * 2);

		$$renderer.push(`<p>Count: 0</p> <p>Doubled: 0</p> <p>Store value: ${$.escape($.store_get($$store_subs ??= {}, '$store', store).foo)}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}