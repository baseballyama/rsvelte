import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Group_series_labels($$anchor, $$props) {
	$.push($$props, true);

	const data = wideData;
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 24 }));

		BarChart($$anchor, {
			get data() {
				return wideData;
			},
			x: 'year',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'cherries', color: 'var(--color-cherries)' },
				{ key: 'grapes', color: 'var(--color-grapes)' }
			],
			seriesLayout: 'group',
			bandPadding: 0.2,
			labels: true,
			props: {
				xAxis: { format: 'none' },
				yAxis: { format: 'metric' },
				tooltip: { header: { format: 'none' } }
			},

			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}