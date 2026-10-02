import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';
import Bug3 from './Bug3.svelte';

export default function Allow_reassign_bind1_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let svelteSet = new SvelteSet([]);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Bug3($$renderer, {
				get svelteSet() {
					return svelteSet;
				},

				set svelteSet($$value) {
					svelteSet = $$value;
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
	});
}