import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { scalePoint } from 'd3-scale';
import { longData } from '$lib/utils/data.js';

export default function Point_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		AreaChart($$renderer, {
			data,
			xScale: scalePoint(),
			x: 'fruit',
			y: 'value',
			padding: defaultChartPadding({ left: 30, right: 15 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}