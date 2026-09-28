import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Slider } from '$lib';

var root = $.from_html(`<!> <!> <!> <!> <pre> </pre>`, 1);

export default function TestSliderWide($$anchor) {
	let value = 0;
	let wide = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		format: (v) => v.toFixed(2),
		label: 'Let it Slide Wide',
		max: 1,
		min: -1,
		wide: true,
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Slider(node_1, {
		format: (v) => v.toFixed(2),
		label: 'Let it Slide',
		max: 1,
		min: -1,
		wide: false,
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Slider(node_2, {
		format: (v) => v.toFixed(2),
		label: 'Let it Slide Wide if Checked',
		max: 1,
		min: -1,
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

	Checkbox(node_3, {
		label: 'Wide',
		get value() {
			return wide;
		},

		set value($$value) {
			wide = $$value;
		}
	});

	var pre = $.sibling(node_3, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Value: ${value ?? ''}`));
	$.append($$anchor, fragment);
}