import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { longData } from '$lib/utils/data.js';

export default function Stack_long_data($$renderer, $$props) {
	const data = longData;

	BarChart($$renderer, {
		data,
		x: 'year',
		y: 'value',
		c: 'fruit',
		cRange: [
			'var(--color-apples)',
			'var(--color-bananas)',
			'var(--color-cherries)',
			'var(--color-grapes)'
		],
		props: {
			xAxis: { format: 'none' },
			yAxis: { format: 'metric' },
			tooltip: { header: { format: 'none' } }
		},
		legend: true,
		height: 300
	});

	$.bind_props($$props, { data });
}