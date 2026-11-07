import * as $ from 'svelte/internal/server';
import Child from './child.svelte';
import { global } from './state.svelte.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		global.value.count = 0;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Child($$renderer, {
				get a() {
					return global.value;
				},

				set a($$value) {
					global.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <button>clicks: ${$.escape(global.value.count)}</button>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}