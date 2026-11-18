import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
export default function Store_subscription_declared($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const a = writable(0);
		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, "$a", a))}`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
