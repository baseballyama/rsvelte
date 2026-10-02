import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Switch01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		const constStore = writable('hello');

		switch ($.store_get($$store_subs ??= {}, '$store', store)) {
			case 'hello':
				console.log('hello');
				break;

			default:
				console.log('other');
		}

		switch ($.store_get($$store_subs ??= {}, '$constStore', constStore)) {
			case 'hello':
				console.log('hello');
				break;

			default:
				console.log('other');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}