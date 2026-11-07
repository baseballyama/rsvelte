import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Pan_zoom_custom_constrain($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 100,
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
				constrain: ({ scale, translate }) => ({
					scale: Math.max(1, Math.min(20, scale)),
					translate: { x: Math.min(0, translate.x), y: 0 }
				})
			},
			padding: defaultChartPadding({ left: 25 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}