import * as $ from 'svelte/internal/server';
import { Slider } from '$lib';

export default function SvelteTweakpaneRange($$renderer) {
	let speed = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			max: 100,
			min: 0,
			get value() {
				return speed;
			},

			set value($$value) {
				speed = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>${$.escape(speed)}
</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}