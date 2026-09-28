import * as $ from 'svelte/internal/server';
import { toStore } from "svelte/store";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let counter = 0;
		const count = toStore(() => counter, (value) => counter = value);

		$$renderer.push(`<div>Count ${$.escape(counter)}!</div> <div>Count from store ${$.escape($.store_get($$store_subs ??= {}, '$count', count))}!</div> <button>Add 1</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}