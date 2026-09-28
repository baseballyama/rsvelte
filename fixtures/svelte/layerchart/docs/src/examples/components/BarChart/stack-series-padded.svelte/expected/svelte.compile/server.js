import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Stack_series_padded($$renderer, $$props) {
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
		props: {
			xAxis: { format: 'none' },
			yAxis: { format: 'metric' },
			bars: { radius: 5.0, rounded: 'all' },
			tooltip: { header: { format: 'none' } }
		},
		stackPadding: 5.0,
		height: 300
	});

	$.bind_props($$props, { data });
}