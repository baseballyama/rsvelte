import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";

export default function Type_only_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let a = writable(42);

		$$renderer.push(`<!---->${$.escape({ $a: $.store_get($$store_subs ??= {}, '$a', a) })}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}