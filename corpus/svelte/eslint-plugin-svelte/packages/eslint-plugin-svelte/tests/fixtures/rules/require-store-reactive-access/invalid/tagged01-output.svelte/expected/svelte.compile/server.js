import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Tagged01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable((...args) => args.join(','));
		const constStore = writable((...args) => args.join(','));

		console.log($.store_get($$store_subs ??= {}, '$store', store)`abc`);
		console.log($.store_get($$store_subs ??= {}, '$constStore', constStore)`abc`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}