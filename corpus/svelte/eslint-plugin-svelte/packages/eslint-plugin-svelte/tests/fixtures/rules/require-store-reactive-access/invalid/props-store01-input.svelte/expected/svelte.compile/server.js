import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

export default function Props_store01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');

		MyComponent($$renderer, { prop: `Hello ${$.stringify(store)}` });
		$$renderer.push(`<!----> `);
		MyComponent($$renderer, {});
		$$renderer.push(`<!----> `);

		$.css_props($$renderer, true, { '--my-style-var': store }, () => {
			MyComponent($$renderer, {});
		});

		$$renderer.push(` `);
		MyComponent($$renderer, $.spread_props([store]));
		$$renderer.push(`<!---->`);
	});
}