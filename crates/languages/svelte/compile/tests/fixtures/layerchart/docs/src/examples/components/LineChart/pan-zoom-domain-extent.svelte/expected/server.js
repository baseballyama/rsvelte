import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Pan_zoom_domain_extent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 365,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value']
		});

		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			transform: {
				mode: 'domain',
				axis: 'x',
				scaleExtent: [1, 50],
				domainExtent: {
					x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
				}
			},
			padding: defaultChartPadding({ left: 25 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}