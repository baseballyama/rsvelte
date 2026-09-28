import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer) {
	let condition = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (condition) {
			$$renderer.push('<!--[0-->');

			Component($$renderer, {
				get condition() {
					return condition;
				},

				set condition($$value) {
					condition = $$value;
					$$settled = false;
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}