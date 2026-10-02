import * as $ from 'svelte/internal/server';
import { fromStore } from 'svelte/store';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = writable(0);
		const value = fromStore(store);

		$$renderer.push(`<div>${$.escape($.store_get($$store_subs ??= {}, '$store', store))}</div> `);

		if (true) {
			$$renderer.push('<!--[0-->');

			const doubled = value.current * 2;

			$$renderer.push(`<div>${$.escape(value.current)}, ${$.escape(doubled)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button>increment</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}