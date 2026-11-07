import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Group_series_horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = wideData;

		BarChart($$renderer, {
			data,
			orientation: 'horizontal',
			y: 'year',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'cherries', color: 'var(--color-cherries)' },
				{ key: 'grapes', color: 'var(--color-grapes)' }
			],
			seriesLayout: 'group',
			props: {
				xAxis: { format: 'metric' },
				yAxis: { format: 'none' },
				tooltip: { header: { format: 'none' } }
			},
			padding: defaultChartPadding({ left: 24 }),
			height: 500
		});

		$.bind_props($$props, { data });
	});
}