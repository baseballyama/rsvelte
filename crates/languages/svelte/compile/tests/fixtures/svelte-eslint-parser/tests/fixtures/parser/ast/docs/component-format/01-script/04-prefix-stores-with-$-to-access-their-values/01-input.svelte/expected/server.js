import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function _1_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);

		console.log($.store_get($$store_subs ??= {}, '$count', count)); // logs 0
		count.set(1);
		console.log($.store_get($$store_subs ??= {}, '$count', count)); // logs 1
		$.store_set(count, 2);
		console.log($.store_get($$store_subs ??= {}, '$count', count)); // logs 2

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}