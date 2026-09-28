import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from '$lib';

export default function TestFormat($$anchor) {
	let value = 0;

	Slider($$anchor, {
		format: (v) => `${v}px`,
		label: 'Width',
		step: 1,
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});
}