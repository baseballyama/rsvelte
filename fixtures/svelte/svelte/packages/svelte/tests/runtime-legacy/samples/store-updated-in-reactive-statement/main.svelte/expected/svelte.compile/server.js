import * as $ from 'svelte/internal/server';
import { store } from './state.js';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		Child($$renderer, {
			value: $.store_get($$store_subs ??= {}, '$store', store).value
		});

		$$renderer.push(`<!----> <button>1</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}