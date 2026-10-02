import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Checkbox,
	IntervalSlider,
	Ring,
	Separator,
	Slider,
	Stepper,
	Wheel
} from '$lib';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function SvelteTweakpaneWideSlideExample($$anchor) {
	const min = 0;
	const max = 100;
	let value = 50;
	let wide = true;
	var fragment = root();
	var node = $.first_child(fragment);

	Checkbox(node, {
		label: 'Wide',
		get value() {
			return wide;
		},

		set value($$value) {
			wide = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Separator(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Slider(node_2, {
		label: 'Slider',
		max,
		min,
		get wide() {
			return wide;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Stepper(node_3, {
		label: 'Stepper',
		max,
		min,
		step: 10,
		get wide() {
			return wide;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	IntervalSlider(node_4, {
		label: 'IntervalSlider',
		max,
		min,
		value: [min, max],
		get wide() {
			return wide;
		},

		get meanValue() {
			return value;
		},

		set meanValue($$value) {
			value = $$value;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Wheel(node_5, {
		label: 'Wheel',
		max,
		min,
		get wide() {
			return wide;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Ring(node_6, {
		label: 'Ring',
		max,
		min,
		get wide() {
			return wide;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	$.append($$anchor, fragment);
}