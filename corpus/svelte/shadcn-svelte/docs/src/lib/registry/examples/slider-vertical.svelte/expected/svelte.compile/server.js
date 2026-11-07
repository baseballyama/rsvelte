import * as $ from 'svelte/internal/server';
import { Slider } from "$lib/registry/ui/slider/index.js";

export default function Slider_vertical($$renderer) {
	let value = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			type: 'single',
			orientation: 'vertical',
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}