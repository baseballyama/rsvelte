import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import AxisXTop from '../../_components/AxisXTop.percent-range.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="component-container svelte-36sxra"><div class="props svelte-36sxra"><label class="svelte-36sxra"><input type="checkbox" class="svelte-36sxra"/> tickMarks</label> <label class="svelte-36sxra"><input type="checkbox" class="svelte-36sxra"/> gridlines</label> <label class="svelte-36sxra"><input type="checkbox" class="svelte-36sxra"/> baseline</label> <label class="svelte-36sxra"><input type="checkbox" class="svelte-36sxra"/> snapLabels</label> <label><span>tickMarkLength</span> <input type="number" class="svelte-36sxra"/></label> <label class="number svelte-36sxra">tickGutter <input type="number" class="svelte-36sxra"/></label> <label class="number svelte-36sxra">dx <input type="number" class="svelte-36sxra"/></label> <label class="number svelte-36sxra">dy <input type="number" class="svelte-36sxra"/></label></div> <div class="chart-container svelte-36sxra"><div class="mini-container" data-which="percent-range"><!></div></div></div>`);

export default function AxisXTop_html($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = $.state(false);
	let snapLabels = $.state(false);
	let gridlines = $.state(true);
	let baseline = $.state(true);
	let tickMarkLength = $.state(6);
	let tickGutter = $.state(0);
	let dx = $.state(0);
	let dy = $.state(0);
	const padding = { top: 15, bottom: 10 };

	var // let alternate = false;
	// setInterval(() => {
	// 	alternate = !alternate;
	// }, 500);
	div = root();

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
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	LayerCake(node, {
		ssr: true,
		percentRange: true,
		position: 'absolute',
		get padding() {
			return padding;
		},
		x: xKey,
		y: (d) => d[yKey],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					AxisXTop($$anchor, {
						get baseline() {
							return $.get(baseline);
						},

						get tickMarks() {
							return $.get(tickMarks);
						},

						get snapLabels() {
							return $.get(snapLabels);
						},

						get gridlines() {
							return $.get(gridlines);
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

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(label_4, 1, 'number svelte-36sxra', null, classes, { disabled: !$.get(tickMarks) });
		classes_1 = $.set_class(span, 1, 'svelte-36sxra', null, classes_1, { disabled: !$.get(tickMarks) });
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