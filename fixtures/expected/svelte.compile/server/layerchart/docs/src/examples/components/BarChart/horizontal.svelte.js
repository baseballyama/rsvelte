import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		}).slice(0, 10);

		BarChart($$renderer, {
			data,
			x: 'value',
			y: 'date',
			orientation: 'horizontal',
			padding: defaultChartPadding({ left: 30 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}