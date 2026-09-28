import * as $ from 'svelte/internal/server';

import {
	Checkbox,
	IntervalSlider,
	Ring,
	Separator,
	Slider,
	Stepper,
	Wheel
} from '$lib';

export default function SvelteTweakpaneWideSlideExample($$renderer) {
	const min = 0;
	const max = 100;
	let value = 50;
	let wide = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Checkbox($$renderer, {
			label: 'Wide',
			get value() {
				return wide;
			},

			set value($$value) {
				wide = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Separator($$renderer, {});
		$$renderer.push(`<!----> `);

		Slider($$renderer, {
			label: 'Slider',
			max,
			min,
			wide,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Stepper($$renderer, {
			label: 'Stepper',
			max,
			min,
			step: 10,
			wide,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		IntervalSlider($$renderer, {
			label: 'IntervalSlider',
			max,
			min,
			value: [min, max],
			wide,
			get meanValue() {
				return value;
			},

			set meanValue($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Wheel($$renderer, {
			label: 'Wheel',
			max,
			min,
			wide,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Ring($$renderer, {
			label: 'Ring',
			max,
			min,
			wide,
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