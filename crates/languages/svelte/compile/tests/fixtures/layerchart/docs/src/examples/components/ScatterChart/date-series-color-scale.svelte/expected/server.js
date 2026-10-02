import * as $ from 'svelte/internal/server';
import { ScatterChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleThreshold } from 'd3-scale';

export default function Date_series_color_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 20, max: 100, value: 'integer' });

		ScatterChart($$renderer, {
			data,
			xNice: true,
			x: 'date',
			y: 'value',
			yBaseline: 0,
			c: 'value',
			cScale: scaleThreshold(),
			cDomain: [50],
			cRange: ['var(--color-danger)', 'var(--color-success)'],
			padding: 24,
			height: 400
		});

		$.bind_props($$props, { data });
	});
}