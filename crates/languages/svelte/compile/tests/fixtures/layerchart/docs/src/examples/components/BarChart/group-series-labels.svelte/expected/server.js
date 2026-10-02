import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Group_series_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = wideData;

		BarChart($$renderer, {
			data: wideData,
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
			padding: defaultChartPadding({ left: 24 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}