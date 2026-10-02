import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Single_axis_x($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		AreaChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			axis: 'x',
			padding: defaultChartPadding({ left: 10, right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}