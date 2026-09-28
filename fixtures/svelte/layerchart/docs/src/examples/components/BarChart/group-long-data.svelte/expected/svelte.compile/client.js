import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';

export default function Group_long_data($$anchor, $$props) {
	$.push($$props, true);

	const data = longData;
	var $$exports = { data };

	BarChart($$anchor, {
		get data() {
			return data;
		},
		x: 'year',
		x1: 'fruit',
		y: 'value',
		c: 'fruit',
		seriesLayout: 'group',
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

	return $.pop($$exports);
}