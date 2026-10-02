import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, pivotLonger } from 'layerchart';
import { wideData } from '$lib/utils/data.js';
import { group } from 'd3-array';

export default function Series_stack_separate_data($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'cherries', 'grapes'];
	const flatData = pivotLonger(wideData, keys, 'fruit', 'value');
	const dataByFruit = group(flatData, (d) => d.fruit);
	var $$exports = { data: dataByFruit };

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

		BarChart($$anchor, {
			x: 'year',
			y: 'value',
			get series() {
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