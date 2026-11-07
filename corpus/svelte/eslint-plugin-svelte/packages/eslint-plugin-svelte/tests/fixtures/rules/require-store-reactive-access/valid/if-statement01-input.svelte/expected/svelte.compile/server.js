import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function If_statement01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		const constStore = writable('hello');

		if (store) {
			console.log($.store_get($$store_subs ??= {}, '$store', store));
		}

		if ($.store_get($$store_subs ??= {}, '$constStore', constStore)) {
			console.log($.store_get($$store_subs ??= {}, '$constStore', constStore));
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}