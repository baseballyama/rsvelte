import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Labels_within_points($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			xNice: true,
			points: { r: 12 },
			labels: { placement: 'center', class: 'text-xs fill-surface-300' },
			props: { highlight: { points: false } },
			padding: defaultChartPadding({ top: 25, right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}