import * as $ from 'svelte/internal/server';
import { Checkbox, Slider } from '$lib';

export default function TestSliderWide($$renderer) {
	let value = 0;
	let wide = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			format: (v) => v.toFixed(2),
			label: 'Let it Slide Wide',
			max: 1,
			min: -1,
			wide: true,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Slider($$renderer, {
			format: (v) => v.toFixed(2),
			label: 'Let it Slide',
			max: 1,
			min: -1,
			wide: false,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Slider($$renderer, {
			format: (v) => v.toFixed(2),
			label: 'Let it Slide Wide if Checked',
			max: 1,
			min: -1,
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

		$$renderer.push(`<!----> <pre>Value: ${$.escape(value)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}