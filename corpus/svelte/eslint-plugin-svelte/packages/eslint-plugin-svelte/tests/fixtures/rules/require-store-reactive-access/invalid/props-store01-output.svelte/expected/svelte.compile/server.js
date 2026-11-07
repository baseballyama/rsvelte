import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

export default function Props_store01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');

		MyComponent($$renderer, {
			prop: `Hello ${$.stringify($.store_get($$store_subs ??= {}, '$store', store))}`
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

		$$renderer.push(` `);
		MyComponent($$renderer, $.spread_props([$.store_get($$store_subs ??= {}, '$store', store)]));
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}