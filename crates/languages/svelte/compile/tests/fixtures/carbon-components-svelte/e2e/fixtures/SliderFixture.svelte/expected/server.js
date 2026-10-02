import * as $ from 'svelte/internal/server';
import { Slider } from "carbon-components-svelte";

export default function SliderFixture($$renderer) {
	let value = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			'data-testid': 'slider',
			labelText: 'Slider',
			min: 0,
			max: 100,
			step: 1,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div data-testid="value-display">${$.escape(value)}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}