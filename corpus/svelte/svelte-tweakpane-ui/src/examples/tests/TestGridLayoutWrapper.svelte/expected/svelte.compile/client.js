import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Slider } from '$lib';

var root = $.from_html(`<div class="grid-wrapper svelte-2vxm84"><!> <!> <!></div>`);

export default function TestGridLayoutWrapper($$anchor) {
	let colors = 0.95;
	let darkMode = true;
	let numbers = true;
	var div = root();
	var node = $.child(div);

	Slider(node, {
		label: 'Colors',
		max: 1,
		min: 0,
		theme: { baseBorderRadius: '0', bladeValueWidth: '244px' },
		get value() {
			return colors;
		},

		set value($$value) {
			colors = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		label: 'Dark Mode',
		theme: { baseBorderRadius: '0', bladeValueWidth: '75.5px' },
		get value() {
			return darkMode;
		},

		set value($$value) {
			darkMode = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Checkbox(node_2, {
		label: 'Numbers',
		theme: { baseBorderRadius: '0', bladeValueWidth: '80px' },
		get value() {
			return numbers;
		},

		set value($$value) {
			numbers = $$value;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}