import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const foo = writable(0);

		function increment() {
			$.update_store($$store_subs ??= {}, '$foo', foo);
		}

		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$foo', foo))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { increment });
	});
}