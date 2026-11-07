import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { timeDay } from 'd3-time';

export default function Time_scale_interval_horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		BarChart($$renderer, {
			data,
			x: 'value',
			y: 'date',
			yInterval: timeDay,
			orientation: 'horizontal',
			padding: defaultChartPadding({ left: 30, right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}