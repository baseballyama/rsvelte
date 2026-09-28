import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_stack_legend_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		AreaChart($$renderer, {
			data,
			x: 'date',
			series: [
				{
					key: 'apples',
					label: 'Apples 🍏 ',
					color: 'var(--color-apples)'
				},

				{
					key: 'bananas',
					label: 'Bananas 🍌',
					color: 'var(--color-bananas)'
				},

				{
					key: 'oranges',
					label: 'Oranges 🍊',
					color: 'var(--color-oranges)'
				}
			],
			legend: true,
			padding: defaultChartPadding({ legend: true, right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}