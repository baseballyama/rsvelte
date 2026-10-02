import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Legend_placement($$renderer, $$props) {
	const data = wideData;

	BarChart($$renderer, {
		data,
		x: 'year',
		series: [
			{ key: 'apples', color: 'var(--color-apples)' },
			{ key: 'bananas', color: 'var(--color-bananas)' },
			{ key: 'cherries', color: 'var(--color-cherries)' },
			{ key: 'grapes', color: 'var(--color-grapes)' }
		],
		seriesLayout: 'group',
		props: {
			xAxis: { format: 'none' },
			yAxis: { format: 'metric' },
			tooltip: { header: { format: 'none' } }
		},
		legend: { placement: 'top-right', classes: { root: 'mt-2' } },
		height: 300
	});

	$.bind_props($$props, { data });
}