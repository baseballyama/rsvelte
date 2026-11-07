import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';
import { group } from 'd3-array';

export default function Group_series_series_long_data($$anchor, $$props) {
	$.push($$props, true);

	const dataByFruit = group(longData, (d) => d.fruit);
	const data = dataByFruit;
	var $$exports = { data };

	{
		let $0 = $.derived(() => [
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
		]);

		let $1 = $.derived(() => defaultChartPadding({ left: 24 }));

		BarChart($$anchor, {
			x: 'year',
			y: 'value',
			get series() {
				return $.get($0);
			},
			seriesLayout: 'group',
			props: {
				xAxis: { format: 'none' },
				yAxis: { format: 'metric' },
				tooltip: { header: { format: 'none' } }
			},

			get padding() {
				return $.get($1);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}