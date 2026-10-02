import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { timeDay } from 'd3-time';

export default function Time_scale_interval($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		BarChart($$renderer, {
			data: data.filter((d) => Math.random() > 0.7),
			x: 'date',
			y: 'value',
			xInterval: timeDay,
			height: 300
		});

		$.bind_props($$props, { data });
	});
}