import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

const a = writable(0);

export default function Ts_store02_type_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const b = writable(0); // b: Writable<number>, writable(0): Writable<number>

		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$a', a))} ${$.escape($.store_get($$store_subs ??= {}, '$b', b))}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
		// $b: string
	});
}