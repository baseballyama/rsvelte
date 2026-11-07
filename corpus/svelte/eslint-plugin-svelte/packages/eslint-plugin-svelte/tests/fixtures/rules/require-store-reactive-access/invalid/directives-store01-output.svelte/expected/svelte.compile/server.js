import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Directives_store01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		const constStore = writable('hello');
		let color = writable('red');
		let value = writable('hello');
		let handleClick = writable(() => {});
		const list = [];

		$$renderer.push(`<button></button> <div${$.attr_style('', { color: $.store_get($$store_subs ??= {}, '$store', store) })}></div> <div${$.attr_style('', { color })}></div> <div></div> <div></div> <div></div> <div></div> <!--[-->`);

		const each_array = $.ensure_array_like(list);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let e = each_array[$$index];

			$$renderer.push(`<div></div>`);
		}

		$$renderer.push(`<!--]--> <div${$.attr_class('', void 0, {
			'name': $.store_get($$store_subs ??= {}, '$constStore', constStore)
		})}></div> <div${$.attr_class('', void 0, { 'constStore': constStore })}></div> <div${$.attr_class('', void 0, { 'name': store })}></div> <div${$.attr_class('', void 0, { 'store': store })}></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}