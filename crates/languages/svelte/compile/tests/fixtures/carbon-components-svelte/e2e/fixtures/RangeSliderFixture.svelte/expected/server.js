import * as $ from 'svelte/internal/server';
import { RangeSlider } from "carbon-components-svelte";

export default function RangeSliderFixture($$renderer) {
	let value = 20;
	let valueUpper = 80;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RangeSlider($$renderer, {
			'data-testid': 'range-slider',
			labelText: 'Range',
			min: 0,
			max: 100,
			step: 1,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			get valueUpper() {
				return valueUpper;
			},

			set valueUpper($$value) {
				valueUpper = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div data-testid="value-display">${$.escape(value)}</div> <div data-testid="value-upper-display">${$.escape(valueUpper)}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}