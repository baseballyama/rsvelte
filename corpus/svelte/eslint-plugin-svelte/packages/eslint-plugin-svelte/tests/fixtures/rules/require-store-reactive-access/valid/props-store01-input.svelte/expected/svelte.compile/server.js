import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

export default function Props_store01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MyComponent($$renderer, { prop: store });
			$$renderer.push(`<!----> `);
			MyComponent($$renderer, { store });
			$$renderer.push(`<!----> `);

			MyComponent($$renderer, {
				get value() {
					return store;
				},

				set value($$value) {
					store = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MyComponent($$renderer, {
				get store() {
					return store;
				},

				set store($$value) {
					store = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);
			MyComponent($$renderer, {});
			$$renderer.push(`<!----> `);

			$.css_props(
				$$renderer,
				true,
				{
					'--my-style-var': $.store_get($$store_subs ??= {}, '$store', store)
				},
				() => {
					MyComponent($$renderer, {});
				}
			);
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