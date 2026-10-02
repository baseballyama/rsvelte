import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Svelte_element01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		let value = writable('hello');
		let div = writable('div');
		let input = writable('input');

		$.element($$renderer, $.store_get($$store_subs ??= {}, '$div', div), () => {
			$$renderer.push(`${$.attr('prop', `Hello ${$.stringify($.store_get($$store_subs ??= {}, '$store', store))}`)}`);
		});

		$$renderer.push(` `);

		$.element($$renderer, $.store_get($$store_subs ??= {}, '$div', div), () => {
			$$renderer.push(`${$.attr('prop', $.store_get($$store_subs ??= {}, '$store', store))}`);
		});

		$$renderer.push(` `);

		$.element($$renderer, $.store_get($$store_subs ??= {}, '$div', div), () => {
			$$renderer.push(`${$.attributes({ ...$.store_get($$store_subs ??= {}, '$store', store) })}`);
		});

		$$renderer.push(` `);
		$.element($$renderer, $.store_get($$store_subs ??= {}, '$div', div));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}