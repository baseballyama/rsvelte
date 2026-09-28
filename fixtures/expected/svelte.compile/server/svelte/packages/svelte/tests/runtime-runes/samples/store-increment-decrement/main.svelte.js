import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let x = writable(0);
		const a = $.update_store($$store_subs ??= {}, '$x', x);
		const b = $.update_store_pre($$store_subs ??= {}, '$x', x);
		const c = $.update_store($$store_subs ??= {}, '$x', x, -1);
		const d = $.update_store_pre($$store_subs ??= {}, '$x', x, -1);

		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$x', x))} ${$.escape(a)} ${$.escape(b)} ${$.escape(c)} ${$.escape(d)}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}