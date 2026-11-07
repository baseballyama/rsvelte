import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="mb-2 screenshot-hidden"><!></div>`);

export default function AxisControls($$anchor, $$props) {
	$.push($$props, true);

	// <AxisControl bind:value />
	let value = $.prop($$props, 'value', 15, 80);

	var div = root();
	var node = $.child(div);

	RangeField(node, {
		label: 'tickSpacing',
		labelPlacement: 'left',
		min: 10,
		max: 300,
		step: 10,
		class: 'justify-self-end mb-2',
		get value() {
			return value();
		},

		set value($$value) {
			value($$value);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}