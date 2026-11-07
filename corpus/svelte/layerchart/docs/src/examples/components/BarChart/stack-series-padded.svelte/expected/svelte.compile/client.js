import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Stack_series_padded($$anchor, $$props) {
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

	return $.pop($$exports);
}