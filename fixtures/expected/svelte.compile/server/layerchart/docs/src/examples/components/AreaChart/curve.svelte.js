import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { curveCatmullRom } from 'd3-shape';
import { createDateSeries } from '$lib/utils/data.js';

export default function Curve($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		AreaChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			props: { area: { curve: curveCatmullRom } },
			padding: defaultChartPadding({ right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}