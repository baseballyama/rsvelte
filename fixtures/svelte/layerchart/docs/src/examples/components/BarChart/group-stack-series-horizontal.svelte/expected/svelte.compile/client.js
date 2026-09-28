import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';
import { flatGroup } from 'd3-array';
import { scaleBand } from 'd3-scale';

export default function Group_stack_series_horizontal($$anchor, $$props) {
	$.push($$props, true);

	// One row per year × basket, with a column per fruit to stack
	const data = flatGroup(longData, (d) => d.year, (d) => d.basket).map(([year, basket, rows]) => ({
		year,
		basket,
		...Object.fromEntries(rows.map((d) => [d.fruit, d.value]))
	}));

	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.4).paddingOuter(0.2));
		let $1 = $.derived(() => scaleBand().padding(0.1));
		let $2 = $.derived(() => defaultChartPadding({ legend: true, left: 30 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			orientation: 'horizontal',
			y: 'year',
			get yScale() {
				return $.get($0);
			},
			y1: 'basket',
			get y1Scale() {
				return $.get($1);
			},
			y1Range: ({ yScale }) => [0, yScale.bandwidth?.() ?? 0],
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'cherries', color: 'var(--color-cherries)' },
				{ key: 'grapes', color: 'var(--color-grapes)' }
			],
			legend: true,
			props: {
				xAxis: { format: 'metric' },
				yAxis: { format: 'none' },
				tooltip: { header: { format: 'none' } }
			},

			get padding() {
				return $.get($2);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}