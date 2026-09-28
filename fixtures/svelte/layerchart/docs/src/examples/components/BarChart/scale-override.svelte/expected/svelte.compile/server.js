import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleLog } from 'd3-scale';

export default function Scale_override($$renderer, $$props) {
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
			x: 'date',
			y: 'value',
			yScale: scaleLog(),
			yDomain: [1, 100],
			props: { yAxis: { ticks: [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100] } },
			height: 300
		});

		$.bind_props($$props, { data });
	});
}