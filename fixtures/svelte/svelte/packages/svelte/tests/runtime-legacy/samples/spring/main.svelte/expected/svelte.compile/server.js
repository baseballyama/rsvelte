import * as $ from 'svelte/internal/server';
import { spring } from 'svelte/motion';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const x = spring(0);

		x.set(1);
		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$x', x))}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}