import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
export default function Store_named_state($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const state = writable(1);
		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, "$state", state))}</p>`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
