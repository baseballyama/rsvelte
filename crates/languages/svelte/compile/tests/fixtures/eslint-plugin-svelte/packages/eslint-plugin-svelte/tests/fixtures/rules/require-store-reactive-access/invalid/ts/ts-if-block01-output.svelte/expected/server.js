import * as $ from 'svelte/internal/server';
import { writable, Writable } from 'svelte/store';

export default function Ts_if_block01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = null;
		const constStore = writable('hello');

		if (store) {
			$$renderer.push(`<!--[0--><div${$.attr_class('', void 0, { 'foo': $.store_get($$store_subs ??= {}, '$store', store) })}></div>`);
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