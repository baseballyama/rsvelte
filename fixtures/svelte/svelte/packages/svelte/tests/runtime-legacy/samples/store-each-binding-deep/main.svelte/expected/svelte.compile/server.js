import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let itemStore = writable({ prop: { things: [{ name: "item store" }] } });

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$itemStore', itemStore).prop.things);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let thing = each_array[$$index];

			$$renderer.push(`<input${$.attr('value', thing.name)}/>`);
		}

		$$renderer.push(`<!--]--> <p>${$.escape($.store_get($$store_subs ??= {}, '$itemStore', itemStore).prop.things[0].name)}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}