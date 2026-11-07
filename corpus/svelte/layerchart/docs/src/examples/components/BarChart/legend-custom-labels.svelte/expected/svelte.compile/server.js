import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { wideData } from '$lib/utils/data.js';

export default function Legend_custom_labels($$renderer, $$props) {
	const data = wideData;

	BarChart($$renderer, {
		data,
		x: 'year',
		series: [
			{
				key: 'apples',
				color: 'var(--color-apples)',
				label: 'Green Apples'
			},

			{
				key: 'bananas',
				color: 'var(--color-bananas)',
				label: 'Yellow Bananas'
			},

			{
				key: 'cherries',
				color: 'var(--color-cherries)',
				label: 'Sweet Cherries'
			},

			{
				key: 'grapes',
				color: 'var(--color-grapes)',
				label: 'Purple Grapes'
			}
		],
		seriesLayout: 'group',
		props: {
			xAxis: { format: 'none' },
			yAxis: { format: 'metric' },
			tooltip: { header: { format: 'none' } }
		},
		legend: true,
		height: 300
	});

	$.bind_props($$props, { data });
}