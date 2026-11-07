import * as $ from 'svelte/internal/server';
import Test from "./Test.svelte";

export default function Main($$renderer) {
	let x;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Test($$renderer, $.spread_props([
			{},
			{
				get x() {
					return x;
				},

				set x($$value) {
					x = $$value;
					$$settled = false;
				}
			}
		]));

		$$renderer.push(`<!----> <p>${$.escape(x)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}