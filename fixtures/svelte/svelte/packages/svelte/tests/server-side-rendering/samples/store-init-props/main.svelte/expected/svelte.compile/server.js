import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const page = writable(1);
		const { value = $.store_get($$store_subs ??= {}, '$page', page) } = $$props;

		$$renderer.push(`<!---->${$.escape(value)}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}