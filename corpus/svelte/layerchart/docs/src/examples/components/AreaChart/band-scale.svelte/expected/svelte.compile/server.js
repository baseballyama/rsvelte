import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { scaleBand } from 'd3-scale';
import { longData } from '$lib/utils/data.js';

export default function Band_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		AreaChart($$renderer, {
			data,
			xScale: scaleBand(),
			x: 'fruit',
			y: 'value',
			tooltipContext: { mode: 'band' },
			padding: defaultChartPadding({ left: 30 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}