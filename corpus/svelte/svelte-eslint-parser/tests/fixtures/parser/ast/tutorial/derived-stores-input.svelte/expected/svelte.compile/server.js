import * as $ from 'svelte/internal/server';
import { time, elapsed } from './stores.js';

export default function Derived_stores_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const formatter = new Intl.DateTimeFormat('en', {
			hour12: true,
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit'
		});

		$$renderer.push(`<h1>The time is ${$.escape(formatter.format($.store_get($$store_subs ??= {}, '$time', time)))}</h1> <p>This page has been open for
	${$.escape($.store_get($$store_subs ??= {}, '$elapsed', elapsed))} ${$.escape($.store_get($$store_subs ??= {}, '$elapsed', elapsed) === 1 ? 'second' : 'seconds')}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}