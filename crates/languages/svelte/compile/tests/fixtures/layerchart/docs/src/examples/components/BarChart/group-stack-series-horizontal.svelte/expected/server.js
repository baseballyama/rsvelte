import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';
import { flatGroup } from 'd3-array';
import { scaleBand } from 'd3-scale';

export default function Group_stack_series_horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// One row per year × basket, with a column per fruit to stack
		const data = flatGroup(longData, (d) => d.year, (d) => d.basket).map(([year, basket, rows]) => ({
			year,
			basket,
			...Object.fromEntries(rows.map((d) => [d.fruit, d.value]))
		}));

		BarChart($$renderer, {
			data,
			orientation: 'horizontal',
			y: 'year',
			yScale: scaleBand().paddingInner(0.4).paddingOuter(0.2),
			y1: 'basket',
			y1Scale: scaleBand().padding(0.1),
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
			padding: defaultChartPadding({ legend: true, left: 30 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}