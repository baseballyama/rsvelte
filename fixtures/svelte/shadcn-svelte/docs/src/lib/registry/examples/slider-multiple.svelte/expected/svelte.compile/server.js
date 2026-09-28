import * as $ from 'svelte/internal/server';
import { Slider } from "$lib/registry/ui/slider/index.js";

export default function Slider_multiple($$renderer) {
	let value = [25, 75];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			type: 'multiple',
			max: 100,
			step: 1,
			class: 'max-w-[70%]',
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