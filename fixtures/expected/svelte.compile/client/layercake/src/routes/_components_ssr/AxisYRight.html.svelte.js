import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import AxisYRight from '../../_components/AxisYRight.percent-range.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="component-container svelte-1qpi6hm"><div class="props svelte-1qpi6hm"><label class="svelte-1qpi6hm"><input type="checkbox" class="svelte-1qpi6hm"/> tickMarks</label> <label class="svelte-1qpi6hm"><input type="checkbox" class="svelte-1qpi6hm"/> gridlines</label> <label class="number svelte-1qpi6hm">labelPosition <select><option>above</option><option>even</option></select></label> <label><input type="checkbox" class="svelte-1qpi6hm"/> <span>snapBaselineLabel</span></label> <label><span>tickMarkLength</span> <input type="number" class="svelte-1qpi6hm"/></label> <label class="number svelte-1qpi6hm">tickGutter <input type="number" class="svelte-1qpi6hm"/></label> <label class="number svelte-1qpi6hm">dx <input type="number" class="svelte-1qpi6hm"/></label> <label class="number svelte-1qpi6hm">dy <input type="number" class="svelte-1qpi6hm"/></label></div> <div class="chart-container svelte-1qpi6hm"><div class="mini-container"><!></div></div></div>`);

export default function AxisYRight_html($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	let tickMarks = $.state(false);
	let snapBaselineLabel = $.state(false);
	let labelPosition = $.state('above');
	let gridlines = $.state(true);
	let tickMarkLength = $.state(undefined);
	let tickGutter = $.state(5);
	let dx = $.state(0);
	let dy = $.state(-3);
	const padding = { bottom: 15, right: 25 };

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
	var select = $.sibling($.child(label_2));
	var option = $.child(select);

	option.value = option.__value = 'above';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'even';
	$.reset(select);
	$.init_select(select);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	let classes;
	var input_2 = $.child(label_3);

	$.remove_input_defaults(input_2);

	var span = $.sibling(input_2, 2);
	let classes_1;

	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	let classes_2;
	var span_1 = $.child(label_4);
	let classes_3;
	var input_3 = $.sibling(span_1, 2);

	$.remove_input_defaults(input_3);
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var input_4 = $.sibling($.child(label_5));

	$.remove_input_defaults(input_4);
	$.reset(label_5);

	var label_6 = $.sibling(label_5, 2);
	var input_5 = $.sibling($.child(label_6));

	$.remove_input_defaults(input_5);
	$.reset(label_6);

	var label_7 = $.sibling(label_6, 2);
	var input_6 = $.sibling($.child(label_7));

	$.remove_input_defaults(input_6);
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
					AxisYRight($$anchor, {
						get tickMarks() {
							return $.get(tickMarks);
						},

						get snapBaselineLabel() {
							return $.get(snapBaselineLabel);
						},

						get labelPosition() {
							return $.get(labelPosition);
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
						},
						ticks: 4
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
		classes = $.set_class(label_3, 1, 'svelte-1qpi6hm', null, classes, { disabled: $.get(labelPosition) === 'above' });
		input_2.disabled = $.get(labelPosition) === 'above';
		classes_1 = $.set_class(span, 1, 'svelte-1qpi6hm', null, classes_1, { disabled: $.get(labelPosition) === 'above' });
		classes_2 = $.set_class(label_4, 1, 'number svelte-1qpi6hm', null, classes_2, { disabled: !$.get(tickMarks) });
		classes_3 = $.set_class(span_1, 1, 'svelte-1qpi6hm', null, classes_3, { disabled: !$.get(tickMarks) });
		input_3.disabled = !$.get(tickMarks);
	});

	$.bind_checked(input, () => $.get(tickMarks), ($$value) => $.set(tickMarks, $$value));
	$.bind_checked(input_1, () => $.get(gridlines), ($$value) => $.set(gridlines, $$value));
	$.bind_select_value(select, () => $.get(labelPosition), ($$value) => $.set(labelPosition, $$value));
	$.bind_checked(input_2, () => $.get(snapBaselineLabel), ($$value) => $.set(snapBaselineLabel, $$value));
	$.bind_value(input_3, () => $.get(tickMarkLength), ($$value) => $.set(tickMarkLength, $$value));
	$.bind_value(input_4, () => $.get(tickGutter), ($$value) => $.set(tickGutter, $$value));
	$.bind_value(input_5, () => $.get(dx), ($$value) => $.set(dx, $$value));
	$.bind_value(input_6, () => $.get(dy), ($$value) => $.set(dy, $$value));
	$.append($$anchor, div);
}