import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const items = writable([{ id: 0, text: 'initial' }]);

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$items', items));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<input${$.attr('value', item.text)}/>`);
		}

		$$renderer.push(`<!--]--> <p>${$.escape($.store_get($$store_subs ??= {}, '$items', items)[0].text)}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}