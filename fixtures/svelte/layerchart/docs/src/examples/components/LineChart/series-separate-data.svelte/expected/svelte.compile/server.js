import * as $ from 'svelte/internal/server';
import { LineChart, pivotLonger, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { group } from 'd3-array';

export default function Series_separate_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const data = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const flatData = pivotLonger(data, keys, 'fruit', 'value');
		const dataByFruit = group(flatData, (d) => d.fruit);

		LineChart($$renderer, {
			x: 'date',
			y: 'value',
			series: [
				{
					key: 'apples',
					data: dataByFruit.get('apples'),
					color: 'var(--color-danger)'
				},

				{
					key: 'bananas',
					data: dataByFruit.get('bananas'),
					color: 'var(--color-success)'
				},

				{
					key: 'oranges',
					data: dataByFruit.get('oranges'),
					color: 'var(--color-warning)'
				}
			],
			padding: defaultChartPadding({ right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data: dataByFruit });
	});
}