import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
export default function Store_updates($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let a = writable(1);
		function f() {
			a = writable(2);
			$.update_store($$store_subs ??= {}, "$a", a);
			$.update_store_pre($$store_subs ??= {}, "$a", a);
			$.store_set(a, $.store_get($$store_subs ??= {}, "$a", a) - 1);
			$.store_get($$store_subs ??= {}, "$a", a).x--;
		}
		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, "$a", a))} ${$.escape(a)}</p><button>x</button>`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
