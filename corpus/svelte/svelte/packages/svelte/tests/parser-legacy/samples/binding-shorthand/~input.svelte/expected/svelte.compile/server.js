import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Widget($$renderer, {
			get foo() {
				return foo;
			},

			set foo($$value) {
				foo = $$value;
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