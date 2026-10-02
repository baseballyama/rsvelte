import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Stack_series_diverging($$anchor, $$props) {
	$.push($$props, true);

	const data = wideData;
	var $$exports = { data };

	BarChart($$anchor, {
		get data() {
			return data;
		},
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

	return $.pop($$exports);
}