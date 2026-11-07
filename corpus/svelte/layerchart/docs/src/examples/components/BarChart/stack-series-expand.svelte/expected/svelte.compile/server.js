import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Stack_series_expand($$renderer, $$props) {
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
			seriesLayout: 'stackExpand',
			props: {
				xAxis: { format: 'none' },
				tooltip: { header: { format: 'none' } }
			},
			padding: defaultChartPadding({ left: 30 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}