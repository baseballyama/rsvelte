import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const obj = writable({ name: 'foo' });

		$.store_set(obj, { name: 'bar' });

		const clone = structuredClone($.store_get($$store_subs ??= {}, '$obj', obj));

		$$renderer.push(`<p>${$.escape(clone.name)}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}