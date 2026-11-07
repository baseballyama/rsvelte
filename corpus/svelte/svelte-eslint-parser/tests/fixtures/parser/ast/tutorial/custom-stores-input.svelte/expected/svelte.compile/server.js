import * as $ from 'svelte/internal/server';
import { count } from './stores.js';

export default function Custom_stores_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<h1>The count is ${$.escape($.store_get($$store_subs ??= {}, '$count', count))}</h1> <button>+</button> <button>-</button> <button>reset</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}