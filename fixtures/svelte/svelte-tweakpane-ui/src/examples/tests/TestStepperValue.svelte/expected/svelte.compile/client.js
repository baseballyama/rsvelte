import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stepper } from '$lib';

export default function TestStepperValue($$anchor) {
	// See https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/24
	let linearValue = 1;

	function format(v) {
		return `${v} $`;
	}

	Stepper($$anchor, {
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
		}
	});
}