import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let form = writable({ count: 0 });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Child($$renderer, {
				get form() {
					return $.store_get($$store_subs ??= {}, '$form', form);
				},

				set form($$value) {
					$.store_set(form, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(JSON.stringify($.store_get($$store_subs ??= {}, '$form', form)))}`);
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