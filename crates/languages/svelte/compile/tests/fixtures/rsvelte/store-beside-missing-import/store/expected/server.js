import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
export default function Store($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);
		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, "$count", count))}</p>`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
