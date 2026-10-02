import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			padding: defaultChartPadding({ right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}