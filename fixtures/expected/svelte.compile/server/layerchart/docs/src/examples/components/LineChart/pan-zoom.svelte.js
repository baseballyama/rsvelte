import * as $ from 'svelte/internal/server';
import { LineChart, ChartClipPath, Spline, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Pan_zoom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			transform: { mode: 'domain', axis: 'x' },
			padding: defaultChartPadding({ left: 25 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}