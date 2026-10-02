import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';
import Bug3 from './Bug3.svelte';

export default function Allow_reassign_bind2_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let svelteSet = new SvelteSet([]);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => svelteSet;
			var bind_set = (v) => svelteSet = v;

			Bug3($$renderer, {
				get svelteSet() {
					return bind_get();
				},

				set svelteSet($$value) {
					bind_set($$value);
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