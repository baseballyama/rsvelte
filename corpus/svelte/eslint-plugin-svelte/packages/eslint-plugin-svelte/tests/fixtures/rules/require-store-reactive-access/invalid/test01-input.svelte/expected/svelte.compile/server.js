import * as $ from 'svelte/internal/server';
import { writable, readable, derived, get } from 'svelte/store';

export default function Test01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const storeValue1 = writable('hello');
		const storeValue2 = readable('hello');
		const storeValue3 = derived(storeValue1, () => {});

		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$storeValue1', storeValue1))}</p> <p>${$.escape(get(storeValue1))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$storeValue2', storeValue2))}</p> <p>${$.escape(get(storeValue2))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$storeValue3', storeValue3))}</p> <p>${$.escape(get(storeValue3))}</p> <p>${$.escape(storeValue1)}</p> <p>${$.escape(storeValue2)}</p> <p>${$.escape(storeValue3)}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}