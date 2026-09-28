import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { timeDay } from 'd3-time';

export default function Pan_zoom_domain_extent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 100,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			xInterval: timeDay,
			transform: {
				mode: 'domain',
				axis: 'x',
				scaleExtent: [1, 50],
				domainExtent: { x: { min: 'data', max: 'data' } }
			},
			height: 300
		});

		$.bind_props($$props, { data });
	});
}