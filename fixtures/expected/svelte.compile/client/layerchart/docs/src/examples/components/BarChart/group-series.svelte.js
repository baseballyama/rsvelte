import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Group_series($$anchor, $$props) {
	$.push($$props, true);

	const data = wideData;
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 24 }));

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
			seriesLayout: 'group',
			get padding() {
				return $.get($0);
			},

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