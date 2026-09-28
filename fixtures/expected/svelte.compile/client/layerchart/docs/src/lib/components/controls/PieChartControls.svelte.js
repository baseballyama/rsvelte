import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="flex justify-self-center gap-2 mb-4 screenshot-hidden"><!> <!></div>`);

export default function PieChartControls($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 15, 60),
		value = $.prop($$props, 'value', 15, 75);

	var div = root();
	var node = $.child(div);

	RangeField(node, {
		label: 'Segments',
		min: 2,
		get value() {
			return count();
		},

		set value($$value) {
			count($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Value',
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