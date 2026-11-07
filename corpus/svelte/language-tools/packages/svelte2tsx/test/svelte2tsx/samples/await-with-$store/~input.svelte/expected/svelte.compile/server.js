import * as $ from 'svelte/internal/server';
import { readable } from 'svelte/store';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = readable(Promise.resolve('test'), () => {});

		$.await(
			$$renderer,
			$.store_get($$store_subs ??= {}, '$store', store),
			() => {
				$$renderer.push(`<p>loading</p>`);
			},
			(data) => {
				$$renderer.push(`${$.escape(data)}`);
			}
		);

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}