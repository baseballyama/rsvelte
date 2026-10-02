import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Labels_with_points($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			xNice: true,
			padding: defaultChartPadding({ top: 25, right: 10 }),
			height: 300,
			points: true,
			labels: { offset: 10 }
		});

		$.bind_props($$props, { data });
	});
}