import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { scalePoint } from 'd3-scale';
import { sort } from '@layerstack/utils';
import { longData } from '$lib/utils/data.js';

export default function Long_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// A point scale takes the domain in data order, so the years have to arrive in it
		const data = sort(longData, 'year');

		LineChart($$renderer, {
			data,
			x: 'year',
			xScale: scalePoint(),
			y: 'value',
			c: 'fruit',
			legend: true,
			cRange: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-cherries)',
				'var(--color-grapes)'
			],
			props: { xAxis: { format: 'none' }, yAxis: { format: 'metric' } },
			height: 300
		});

		$.bind_props($$props, { data });
	});
}