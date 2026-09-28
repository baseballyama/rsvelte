import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, ChartGroup, LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="grid gap-2"><!> <!></div>`);

export default function Synced_legend($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	const series = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	];

	const padding = defaultChartPadding({ legend: true, right: 10 });
	var $$exports = { data };

	ChartGroup($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			LineChart(node, {
				get data() {
					return data;
				},
				x: 'date',
				get series() {
					return series;
				},

				get padding() {
					return padding;
				},
				height: 200
			});

			var node_1 = $.sibling(node, 2);

			AreaChart(node_1, {
				get data() {
					return data;
				},
				x: 'date',
				get series() {
					return series;
				},

				get padding() {
					return padding;
				},
				height: 200,
				legend: true
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}