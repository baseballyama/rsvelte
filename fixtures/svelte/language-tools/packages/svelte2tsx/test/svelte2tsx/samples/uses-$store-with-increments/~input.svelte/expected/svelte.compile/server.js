import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);
		const handler1 = () => $.update_store_pre($$store_subs ??= {}, '$count', count);
		const handler2 = () => $.update_store($$store_subs ??= {}, '$count', count, -1);

		$$renderer.push(`<button>add</button> <button>subtract</button> <button>add</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}