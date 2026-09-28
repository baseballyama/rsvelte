import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding, pivotLonger } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { group } from 'd3-array';

export default function Series_point_annotations($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const data = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const flatData = pivotLonger(data, keys, 'fruit', 'value');
	const dataByFruit = group(flatData, (d) => d.fruit);

	const series = $.derived(() => [
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
			key: 'oranges',
			data: dataByFruit.get('oranges'),
			color: 'var(--color-oranges)'
		}
	]);

	var $$exports = { data: dataByFruit };

	{
		let $0 = $.derived(() => $.get(series).map((s) => {
			const lastDataPoint = s.data?.[s.data.length - 1] ?? null;

			return {
				type: 'point',
				seriesKey: s.key,
				label: s.key,
				labelPlacement: 'right',
				labelXOffset: 4,
				x: lastDataPoint.date,
				y: lastDataPoint.value,
				props: { circle: { fill: s.color }, label: { fill: s.color } }
			};
		}));

		let $1 = $.derived(() => defaultChartPadding({ right: 60 }));

		AreaChart($$anchor, {
			x: 'date',
			y: 'value',
			get series() {
				return $.get(series);
			},

			get annotations() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}