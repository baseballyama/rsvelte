import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Stack_series_horizontal($$anchor, $$props) {
	$.push($$props, true);

	const data = wideData;
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 30, right: 10 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			orientation: 'horizontal',
			y: 'year',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'cherries', color: 'var(--color-cherries)' },
				{ key: 'grapes', color: 'var(--color-grapes)' }
			],
			props: {
				xAxis: { format: 'metric' },
				yAxis: { format: 'none' },
				tooltip: { header: { format: 'none' } }
			},
			height: 300,
			get padding() {
				return $.get($0);
			}
		});
	}

	return $.pop($$exports);
}