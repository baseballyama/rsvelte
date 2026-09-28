import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { longData } from '$lib/utils/data.js';
import { flatGroup } from 'd3-array';
import { scaleBand } from 'd3-scale';

export default function Group_stack_series($$anchor, $$props) {
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

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'year',
			get xScale() {
				return $.get($0);
			},
			x1: 'basket',
			get x1Scale() {
				return $.get($1);
			},
			x1Range: ({ xScale }) => [0, xScale.bandwidth?.() ?? 0],
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'cherries', color: 'var(--color-cherries)' },
				{ key: 'grapes', color: 'var(--color-grapes)' }
			],
			legend: true,
			props: {
				yAxis: { format: 'metric' },
				tooltip: { header: { format: 'none' } }
			},
			height: 300
		});
	}

	return $.pop($$exports);
}