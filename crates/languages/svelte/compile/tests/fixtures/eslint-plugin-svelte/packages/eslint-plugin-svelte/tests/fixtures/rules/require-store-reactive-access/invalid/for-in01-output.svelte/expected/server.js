import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function For_in01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		const constStore = writable('hello');

		for (const k in $.store_get($$store_subs ??= {}, '$store', store)) {
			console.log(k);
		}

		for (const k in $.store_get($$store_subs ??= {}, '$constStore', constStore)) {
			console.log(k);
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}