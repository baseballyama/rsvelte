import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ArcChart,
	AreaChart,
	BarChart,
	LineChart,
	PieChart,
	ScatterChart
} from 'layerchart';

var root = $.from_html(`<div class="grid grid-cols-2 gap-10"><div class="h-[200px]"><!></div> <div class="h-[200px]"><!></div> <div class="h-[200px]"><!></div> <div class="h-[200px]"><!></div> <div class="h-[200px]"><!></div> <div class="h-[200px]"><!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ date: new Date('2025-01-01T00:00'), value: 30 },
		{ date: new Date('2025-02-01T00:00'), value: 50 },
		{ date: new Date('2025-03-01T00:00'), value: 40 },
		{ date: new Date('2025-04-01T00:00'), value: 70 },
		{ date: new Date('2025-05-01T00:00'), value: 60 },
		{ date: new Date('2025-06-01T00:00'), value: 90 }
	];

	const pieData = [
		{ fruit: 'Apples', value: 3840 },
		{ fruit: 'Bananas', value: 1920 },
		{ fruit: 'Cherries', value: 960 },
		{ fruit: 'Grapes', value: 400 }
	];

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	AreaChart(node, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value'
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	LineChart(node_1, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value'
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	BarChart(node_2, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value'
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	ScatterChart(node_3, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value'
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_4 = $.child(div_5);

	PieChart(node_4, {
		get data() {
			return pieData;
		},
		key: 'fruit',
		value: 'value'
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_5 = $.child(div_6);

	ArcChart(node_5, {
		data: [{ key: 'Example', value: 70 }],
		maxValue: 100,
		innerRadius: -20,
		cornerRadius: 10
	});

	$.reset(div_6);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}