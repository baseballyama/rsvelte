import * as $ from 'svelte/internal/server';
import Bound from './Bound.svelte';

export default function Binding($$renderer) {
	let open;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Bound($$renderer, {
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
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
}