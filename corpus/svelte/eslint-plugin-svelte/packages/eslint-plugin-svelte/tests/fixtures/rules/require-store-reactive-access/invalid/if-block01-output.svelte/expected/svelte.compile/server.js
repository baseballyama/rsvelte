import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function If_block01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		const constStore = writable('hello');

		if (store) {
			$$renderer.push(`<!--[0--><div${$.attr_class('', void 0, { 'foo': store })}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$constStore', constStore)) {
			$$renderer.push(`<!--[0--><div${$.attr_class('', void 0, {
				'foo': $.store_get($$store_subs ??= {}, '$constStore', constStore)
			})}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}