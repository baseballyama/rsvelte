import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);
		const handler1 = () => !$.store_get($$store_subs ??= {}, '$count', count);
		const handler2 = () => +$.store_get($$store_subs ??= {}, '$count', count);
		const handler3 = () => -$.store_get($$store_subs ??= {}, '$count', count);
		const handler4 = () => ~$.store_get($$store_subs ??= {}, '$count', count);

		$$renderer.push(`<button>add</button> <button>add</button> <button>add</button> <button>add</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}