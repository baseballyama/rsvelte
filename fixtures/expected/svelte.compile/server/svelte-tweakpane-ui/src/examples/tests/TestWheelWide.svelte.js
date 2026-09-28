import * as $ from 'svelte/internal/server';
import { Checkbox, Wheel } from '$lib';

export default function TestWheelWide($$renderer) {
	let value = 0;
	let wide = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Wheel($$renderer, {
			label: 'Wheel 1',
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