import * as $ from 'svelte/internal/server';
import { Stepper } from '$lib';

export default function TestStepperValue($$renderer) {
	// See https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/24
	let linearValue = 1;

	function format(v) {
		return `${v} $`;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stepper($$renderer, {
			format,
			label: 'Bla',
			max: 10,
			min: 0,
			step: 0.5,
			get value() {
				return linearValue;
			},

			set value($$value) {
				linearValue = $$value;
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