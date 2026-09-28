import * as $ from 'svelte/internal/server';
import { Slider } from '$lib';

export default function TestFormat($$renderer) {
	let value = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			format: (v) => `${v}px`,
			label: 'Width',
			step: 1,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
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