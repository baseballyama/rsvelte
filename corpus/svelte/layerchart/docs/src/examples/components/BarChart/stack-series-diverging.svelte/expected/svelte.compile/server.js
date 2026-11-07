import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Stack_series_diverging($$renderer, $$props) {
	const data = wideData;

	BarChart($$renderer, {
		data,
		x: 'year',
		series: [
			{ key: 'apples', color: 'var(--color-apples)' },
			{ key: 'grapes', color: 'var(--color-grapes)' },
			{
				key: 'bananas',
				value: (d) => -d.bananas,
				color: 'var(--color-bananas)'
			}
		],
		seriesLayout: 'stackDiverging',
		props: {
			xAxis: { format: 'none' },
			yAxis: { format: 'metric' },
			tooltip: { header: { format: 'none' } }
		},
		height: 300
	});

	$.bind_props($$props, { data });
}