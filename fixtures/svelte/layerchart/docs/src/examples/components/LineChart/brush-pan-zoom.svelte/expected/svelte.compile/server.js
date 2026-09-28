import * as $ from 'svelte/internal/server';
import { LineChart, ChartClipPath, Spline, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Brush_pan_zoom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			brush: true,
			transform: { mode: 'domain', axis: 'x' },
			motion: { type: 'spring' },
			clip: true,
			padding: defaultChartPadding({ left: 25 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}