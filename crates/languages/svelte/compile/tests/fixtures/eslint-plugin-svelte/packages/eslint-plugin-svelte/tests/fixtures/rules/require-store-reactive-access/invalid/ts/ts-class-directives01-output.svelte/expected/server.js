import * as $ from 'svelte/internal/server';
import { writable, Writable } from 'svelte/store';

export default function Ts_class_directives01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = null;
		const constStore = writable('hello');

		$$renderer.push(`<div${$.attr_style('', { color: $.store_get($$store_subs ??= {}, '$store', store) })}></div> <div${$.attr_class('', void 0, {
			'name': $.store_get($$store_subs ??= {}, '$constStore', constStore)
		})}></div> <div${$.attr_class('', void 0, { 'constStore': constStore })}></div> <div${$.attr_class('', void 0, { 'name': store })}></div> <div${$.attr_class('', void 0, { 'store': store })}></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}