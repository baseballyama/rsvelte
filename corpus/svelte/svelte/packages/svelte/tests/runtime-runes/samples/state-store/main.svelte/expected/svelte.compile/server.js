import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let test_store = writable({ id: 0 });
		let counter = 3;

		$$renderer.push(`<p>test_store: ${$.escape($.store_get($$store_subs ??= {}, '$test_store', test_store).id)}</p> <p>counter: ${$.escape(counter)}</p> <button>+1</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}