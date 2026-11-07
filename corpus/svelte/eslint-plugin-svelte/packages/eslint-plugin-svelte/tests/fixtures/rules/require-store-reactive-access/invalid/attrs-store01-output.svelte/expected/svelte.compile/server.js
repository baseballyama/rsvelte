import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Attrs_store01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		let value = writable('hello');

		$$renderer.push(`<div${$.attr('prop', `Hello ${$.stringify($.store_get($$store_subs ??= {}, '$store', store))}`)}></div> <div${$.attr('prop', $.store_get($$store_subs ??= {}, '$store', store))}></div> <div${$.attr('store', store)}></div> <div${$.attributes({ ...$.store_get($$store_subs ??= {}, '$store', store) })}></div> <div></div> <input${$.attr('value', value)}/>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}