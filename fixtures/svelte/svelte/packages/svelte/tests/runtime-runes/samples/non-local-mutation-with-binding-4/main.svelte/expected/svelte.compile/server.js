import * as $ from 'svelte/internal/server';
import Outer from './Outer.svelte';
import Inner from './Inner.svelte';

export default function Main($$renderer) {
	let object = { count: 0 };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Outer($$renderer, {
			children: ($$renderer) => {
				Inner($$renderer, {
					get object() {
						return object;
					},

					set object($$value) {
						object = $$value;
						$$settled = false;
					}
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