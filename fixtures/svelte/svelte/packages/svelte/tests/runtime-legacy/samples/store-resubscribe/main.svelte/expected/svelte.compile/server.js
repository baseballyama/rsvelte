import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let foo = writable(0);

		$$renderer.push(`<h1>${$.escape($.store_get($$store_subs ??= {}, '$foo', foo))}</h1> <button>+1</button> <button>reset</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}