import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store1 = writable('store');

		let store2 = {
			subscribe: (cb) => {
				cb('...');
				cb('Hello');

				return () => {};
			}
		};

		let store3 = undefined;

		// store signal is updated during reading this, which normally errors, but shouldn't for stores
		let name = $.derived(() => $.store_get($$store_subs ??= {}, '$store1', store1));

		let hello = $.derived(() => $.store_get($$store_subs ??= {}, '$store2', store2));
		let undefined_value = $.derived(() => $.store_get($$store_subs ??= {}, '$store3', store3));

		$$renderer.push(`<h1>${$.escape(hello())} ${$.escape(name())} ${$.escape(undefined_value())}</h1>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}