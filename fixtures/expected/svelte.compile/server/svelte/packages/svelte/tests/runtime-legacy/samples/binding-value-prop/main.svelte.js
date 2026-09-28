import * as $ from 'svelte/internal/server';
import Field from './Field.svelte';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const value = writable('aaa');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Field($$renderer, {
				get value() {
					return $.store_get($$store_subs ??= {}, '$value', value);
				},

				set value($$value) {
					$.store_set(value, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$value', value))}`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}