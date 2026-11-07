import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';
import { writable } from 'svelte/store';

export default function Svelte_component01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
		let component = writable(MyComponent);

		if (component) {
			$$renderer.push('<!--[-->');
			component($$renderer, { prop: `Hello ${$.stringify(store)}` });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (component) {
			$$renderer.push('<!--[-->');
			component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.css_props(
			$$renderer,
			true,
			{ '--my-style-var': store },
			() => {
				if (component) {
					$$renderer.push('<!--[-->');
					component($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			true
		);

		$$renderer.push(` `);

		if (component) {
			$$renderer.push('<!--[-->');
			component($$renderer, $.spread_props([store]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}