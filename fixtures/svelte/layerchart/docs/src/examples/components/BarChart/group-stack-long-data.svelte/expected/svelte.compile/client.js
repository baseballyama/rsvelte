import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { longData } from '$lib/utils/data.js';
import { scaleBand } from 'd3-scale';

export default function Group_stack_long_data($$anchor, $$props) {
	$.push($$props, true);

	const data = longData;
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
			y: 'value',
			c: 'fruit',
			cRange: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-cherries)',
				'var(--color-grapes)'
			],
			legend: true,
			props: {
				xAxis: { format: 'none' },
				yAxis: { format: 'metric' },
				tooltip: { header: { format: 'none' } }
			},
			height: 300
		});
	}

	return $.pop($$exports);
}