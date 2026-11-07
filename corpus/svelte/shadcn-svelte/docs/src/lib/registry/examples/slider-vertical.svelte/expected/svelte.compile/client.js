import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "$lib/registry/ui/slider/index.js";

export default function Slider_vertical($$anchor) {
	let value = $.state(50);

	Slider($$anchor, {
		type: 'single',
		orientation: 'vertical',
		max: 100,
		step: 1,
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});
}