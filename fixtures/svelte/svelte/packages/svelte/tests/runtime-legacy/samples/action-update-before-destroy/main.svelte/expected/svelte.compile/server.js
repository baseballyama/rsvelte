import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Component from "./Component.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let items = writable({ 1: { id: 1 } });

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(Object.values($.store_get($$store_subs ??= {}, '$items', items)));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Component($$renderer, { id: item.id, items });
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}