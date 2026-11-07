import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Parent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { test = {} } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Child($$renderer, {
				get test() {
					return test;
				},

				set test($$value) {
					test = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { test });
	});
}