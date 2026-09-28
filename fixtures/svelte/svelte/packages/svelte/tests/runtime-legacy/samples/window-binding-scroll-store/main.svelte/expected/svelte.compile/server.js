import * as $ from 'svelte/internal/server';
import { writable, derived } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const y = writable(0);
		const y_squared = derived(y, ($y) => $y * $y);

		$$renderer.push(`<p style="position: fixed; top: 1em; left: 1em;">scroll y is ${$.escape($.store_get($$store_subs ??= {}, '$y', y))}. ${$.escape($.store_get($$store_subs ??= {}, '$y', y))} * ${$.escape($.store_get($$store_subs ??= {}, '$y', y))} = ${$.escape($.store_get($$store_subs ??= {}, '$y_squared', y_squared))}</p> <div style="height: 9999px"></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}