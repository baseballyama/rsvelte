import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Group_series($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			padding: defaultChartPadding({ left: 24 }),
			props: {
				xAxis: { format: 'none' },
				yAxis: { format: 'metric' },
				tooltip: { header: { format: 'none' } }
			},
			height: 300
		});

		$.bind_props($$props, { data });
	});
}