import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleThreshold } from 'd3-scale';

export default function Color_threshold($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 10, min: -20, max: 50, value: 'integer' });

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			c: 'value',
			cScale: scaleThreshold(),
			cDomain: [0],
			cRange: ['var(--color-danger)', 'var(--color-success)'],
			height: 300
		});

		$.bind_props($$props, { data });
	});
}