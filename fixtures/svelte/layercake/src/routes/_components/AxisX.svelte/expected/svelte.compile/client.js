import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import AxisX from '../../_components/AxisX.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="component-container svelte-13bb6qr"><div class="props svelte-13bb6qr"><label class="svelte-13bb6qr"><input type="checkbox" class="svelte-13bb6qr"/> tickMarks</label> <label class="svelte-13bb6qr"><input type="checkbox" class="svelte-13bb6qr"/> gridlines</label> <label class="svelte-13bb6qr"><input type="checkbox" class="svelte-13bb6qr"/> baseline</label> <label class="svelte-13bb6qr"><input type="checkbox" class="svelte-13bb6qr"/> snapLabels</label> <label><span>tickMarkLength</span> <input type="number" class="svelte-13bb6qr"/></label> <label class="number svelte-13bb6qr">tickGutter <input type="number" class="svelte-13bb6qr"/></label> <label class="number svelte-13bb6qr">dx <input type="number" class="svelte-13bb6qr"/></label> <label class="number svelte-13bb6qr">dy <input type="number" class="svelte-13bb6qr"/></label></div> <div class="chart-container svelte-13bb6qr"><!></div></div>`);

export default function AxisX_1($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = $.state(false);
	let gridlines = $.state(true);
	let snapLabels = $.state(false);
	let baseline = $.state(true);
	let tickMarkLength = $.state(6);
	let tickGutter = $.state(0);
	let dx = $.state(0);
	let dy = $.state(12);
	var div = root();
	var div_1 = $.child(div);
	var label = $.child(div_1);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	$.next();
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.child(label_3);

	$.remove_input_defaults(input_3);
	$.next();
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	let classes;
	var span = $.child(label_4);
	let classes_1;
	var input_4 = $.sibling(span, 2);

	$.remove_input_defaults(input_4);
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var input_5 = $.sibling($.child(label_5));

	$.remove_input_defaults(input_5);
	$.reset(label_5);

	var label_6 = $.sibling(label_5, 2);
	var input_6 = $.sibling($.child(label_6));

	$.remove_input_defaults(input_6);
	$.reset(label_6);

	var label_7 = $.sibling(label_6, 2);
	var input_7 = $.sibling($.child(label_7));

	$.remove_input_defaults(input_7);
	$.reset(label_7);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node = $.child(div_2);

	LayerCake(node, {
		padding: { top: 10, bottom: 20 },
		x: xKey,
		y: yKey,
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					AxisX($$anchor, {
						get baseline() {
							return $.get(baseline);
						},

						get tickMarks() {
							return $.get(tickMarks);
						},

						get gridlines() {
							return $.get(gridlines);
						},

						get snapLabels() {
							return $.get(snapLabels);
						},

						get tickMarkLength() {
							return $.get(tickMarkLength);
						},

						get tickGutter() {
							return $.get(tickGutter);
						},

						get dx() {
							return $.get(dx);
						},

						get dy() {
							return $.get(dy);
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(label_4, 1, 'number svelte-13bb6qr', null, classes, { disabled: !$.get(tickMarks) });
		classes_1 = $.set_class(span, 1, 'svelte-13bb6qr', null, classes_1, { disabled: !$.get(tickMarks) });
		input_4.disabled = !$.get(tickMarks);
	});

	$.bind_checked(input, () => $.get(tickMarks), ($$value) => $.set(tickMarks, $$value));
	$.bind_checked(input_1, () => $.get(gridlines), ($$value) => $.set(gridlines, $$value));
	$.bind_checked(input_2, () => $.get(baseline), ($$value) => $.set(baseline, $$value));
	$.bind_checked(input_3, () => $.get(snapLabels), ($$value) => $.set(snapLabels, $$value));
	$.bind_value(input_4, () => $.get(tickMarkLength), ($$value) => $.set(tickMarkLength, $$value));
	$.bind_value(input_5, () => $.get(tickGutter), ($$value) => $.set(tickGutter, $$value));
	$.bind_value(input_6, () => $.get(dx), ($$value) => $.set(dx, $$value));
	$.bind_value(input_7, () => $.get(dy), ($$value) => $.set(dy, $$value));
	$.append($$anchor, div);
}