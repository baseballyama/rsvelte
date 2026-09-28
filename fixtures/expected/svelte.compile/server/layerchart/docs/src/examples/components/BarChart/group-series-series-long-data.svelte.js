import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';
import { group } from 'd3-array';

export default function Group_series_series_long_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dataByFruit = group(longData, (d) => d.fruit);
		const data = dataByFruit;

		BarChart($$renderer, {
			x: 'year',
			y: 'value',
			series: [
				{
					key: 'apples',
					data: dataByFruit.get('apples'),
					color: 'var(--color-apples)'
				},

				{
					key: 'bananas',
					data: dataByFruit.get('bananas'),
					color: 'var(--color-bananas)'
				},

				{
					key: 'cherries',
					data: dataByFruit.get('cherries'),
					color: 'var(--color-cherries)'
				},

				{
					key: 'grapes',
					data: dataByFruit.get('grapes'),
					color: 'var(--color-grapes)'
				}
			],
			seriesLayout: 'group',
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