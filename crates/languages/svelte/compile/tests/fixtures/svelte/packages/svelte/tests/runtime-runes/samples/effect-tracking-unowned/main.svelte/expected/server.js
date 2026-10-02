import * as $ from 'svelte/internal/server';
import { writable, fromStore, toStore } from "svelte/store";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = writable("previous");
		let text = $.derived(() => fromStore(store).current + " message");

		text(); // read derived in a non-tracking context
		$$renderer.push(`<o>Store: ${$.escape($.store_get($$store_subs ??= {}, '$store', store))}</o> <p>Text: ${$.escape(text())}</p> <button>Change Store</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}