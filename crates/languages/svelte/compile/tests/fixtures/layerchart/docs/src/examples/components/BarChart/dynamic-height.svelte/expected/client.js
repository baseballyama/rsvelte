import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';

var root = $.from_html(`<label><input type="radio"/> 2</label> <label><input type="radio"/> 4</label> <label><input type="radio"/> 6</label> <!>`, 1);

export default function Dynamic_height($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	let data2 = [
		{ name: 'One', value1: 10, value2: 20 },
		{ name: 'Two', value1: 5, value2: 20 }
	];

	let data4 = [
		{ name: 'One', value1: 10, value2: 20 },
		{ name: 'Two', value1: 5, value2: 20 },
		{ name: 'Three', value1: 15, value2: 15 },
		{ name: 'Four', value1: 10, value2: 5 }
	];

	let data6 = [
		{ name: 'One', value1: 10, value2: 20 },
		{ name: 'Two', value1: 5, value2: 20 },
		{ name: 'Three', value1: 15, value2: 15 },
		{ name: 'Four', value1: 10, value2: 5 },
		{ name: 'Five', value1: 8, value2: 5 },
		{ name: 'Size', value1: 3, value2: 5 }
	];

	let seriesCount = $.state(2);
	let data = $.derived(() => $.get(seriesCount) === 2 ? data2 : $.get(seriesCount) === 4 ? data4 : data6);
	let barHeight = 50;
	let padding = { top: 4, bottom: 20 };
	let bandPadding = 0.4;
	let chartHeight = $.derived(() => (barHeight + barHeight * bandPadding) * $.get(seriesCount) + barHeight * bandPadding + padding.top + padding.bottom + 8);
	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 2;
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 4;
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 6;
	$.next();
	$.reset(label_2);

	var node = $.sibling(label_2, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 20 }));

		BarChart(node, {
			get data() {
				return $.get(data);
			},
			bandPadding,
			y: 'name',
			series: [
				{ key: 'value1', color: 'hsl(100 100% 50%)' },
				{ key: 'value2', color: 'hsl(200 100% 50%)' }
			],
			orientation: 'horizontal',
			seriesLayout: 'stackExpand',
			get padding() {
				return $.get($0);
			},

			get height() {
				return $.get(chartHeight);
			}
		});
	}

	$.bind_group(
		binding_group,
		[],
		input,
		() => {
			2;

			return $.get(seriesCount);
		},
		($$value) => $.set(seriesCount, $$value)
	);

	$.bind_group(
		binding_group,
		[],
		input_1,
		() => {
			4;

			return $.get(seriesCount);
		},
		($$value) => $.set(seriesCount, $$value)
	);

	$.bind_group(
		binding_group,
		[],
		input_2,
		() => {
			6;

			return $.get(seriesCount);
		},
		($$value) => $.set(seriesCount, $$value)
	);

	$.append($$anchor, fragment);
	$.pop();
}