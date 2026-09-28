import * as $ from 'svelte/internal/server';
import { RangeField } from 'svelte-ux';

export default function AxisControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// <AxisControl bind:value />
		let { value = 80 } = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mb-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'tickSpacing',
				labelPlacement: 'left',
				min: 10,
				max: 300,
				step: 10,
				class: 'justify-self-end mb-2',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}