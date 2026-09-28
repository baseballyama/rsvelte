import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

function hello($$renderer) {
	$$renderer.push(`<p>hello world</p>`);
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let snippet = writable(hello);

		$.store_get($$store_subs ??= {}, '$snippet', snippet)($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}