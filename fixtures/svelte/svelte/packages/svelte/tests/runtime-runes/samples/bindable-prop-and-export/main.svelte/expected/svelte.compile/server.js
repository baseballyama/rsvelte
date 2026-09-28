import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer) {
	let open = true;
	let comp;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Component($$renderer, {
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <button>${$.escape(open)}</button> <input type="checkbox"${$.attr('checked', open, true)}/>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}