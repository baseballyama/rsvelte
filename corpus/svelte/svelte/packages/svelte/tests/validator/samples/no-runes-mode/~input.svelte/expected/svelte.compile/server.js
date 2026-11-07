import * as $ from 'svelte/internal/server';
import { state } from './store';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const x = $.store_get($$store_subs ??= {}, '$state', state)();

		$$renderer.push(`<!---->${$.escape(x)}`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}