import * as $ from 'svelte/internal/server';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';
import Component3 from './Component3.svelte';

export default function Main($$renderer) {
	let count = { value: 0 };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Component1($$renderer, {
			children: ($$renderer) => {
				Component2($$renderer, {
					children: ($$renderer) => {
						Component3($$renderer, {
							get count() {
								return count;
							},

							set count($$value) {
								count = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}