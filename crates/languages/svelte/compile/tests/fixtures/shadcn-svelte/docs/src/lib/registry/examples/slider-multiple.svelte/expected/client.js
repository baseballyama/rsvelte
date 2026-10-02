import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "$lib/registry/ui/slider/index.js";

export default function Slider_multiple($$anchor) {
	let value = $.state($.proxy([25, 75]));

	Slider($$anchor, {
		type: 'multiple',
		max: 100,
		step: 1,
		class: 'max-w-[70%]',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});
}