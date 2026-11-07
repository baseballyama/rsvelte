import * as $ from 'svelte/internal/server';

export default function Input_1($$renderer) {
	let value;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<input${$.attr('value', value)}/> `);

		Input($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}