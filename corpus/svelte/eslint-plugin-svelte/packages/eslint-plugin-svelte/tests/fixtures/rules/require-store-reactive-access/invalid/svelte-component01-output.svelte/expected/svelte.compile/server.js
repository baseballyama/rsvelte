import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

export default function Svelte_component01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		let component = writable(MyComponent);

		if ($.store_get($$store_subs ??= {}, '$component', component)) {
			$$renderer.push('<!--[-->');

			$.store_get($$store_subs ??= {}, '$component', component)($$renderer, {
				prop: `Hello ${$.stringify($.store_get($$store_subs ??= {}, '$store', store))}`
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if ($.store_get($$store_subs ??= {}, '$component', component)) {
			$$renderer.push('<!--[-->');
			$.store_get($$store_subs ??= {}, '$component', component)($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.css_props(
			$$renderer,
			true,
			{
				'--my-style-var': $.store_get($$store_subs ??= {}, '$store', store)
			},
			() => {
				if ($.store_get($$store_subs ??= {}, '$component', component)) {
					$$renderer.push('<!--[-->');
					$.store_get($$store_subs ??= {}, '$component', component)($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			true
		);

		$$renderer.push(` `);

		if ($.store_get($$store_subs ??= {}, '$component', component)) {
			$$renderer.push('<!--[-->');
			$.store_get($$store_subs ??= {}, '$component', component)($$renderer, $.spread_props([$.store_get($$store_subs ??= {}, '$store', store)]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}