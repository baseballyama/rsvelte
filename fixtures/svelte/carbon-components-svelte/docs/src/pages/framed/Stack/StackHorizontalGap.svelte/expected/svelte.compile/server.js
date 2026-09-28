import * as $ from 'svelte/internal/server';
import { Slider, Stack } from "carbon-components-svelte";

export default function StackHorizontalGap($$renderer) {
	let gap = 5;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div style="margin-bottom: 1.5rem">`);

		Slider($$renderer, {
			labelText: 'Gap',
			min: 0,
			max: 13,
			minLabel: '0',
			maxLabel: '13',
			get value() {
				return gap;
			},

			set value($$value) {
				gap = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> `);

		Stack($$renderer, {
			orientation: 'horizontal',
			gap,
			children: ($$renderer) => {
				$$renderer.push(`<div>Item 1</div> <div>Item 2</div> <div>Item 3</div>`);
			},
			$$slots: { default: true }
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