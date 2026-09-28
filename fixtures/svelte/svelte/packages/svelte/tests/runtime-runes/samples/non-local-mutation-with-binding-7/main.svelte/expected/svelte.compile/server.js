import * as $ from 'svelte/internal/server';
import Component1 from './Component1.svelte';

export default function Main($$renderer) {
	let rows = [{}];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Component1($$renderer, {
			get rows() {
				return rows;
			},

			set rows($$value) {
				rows = $$value;
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