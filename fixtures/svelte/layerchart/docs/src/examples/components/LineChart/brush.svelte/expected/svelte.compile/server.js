import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Brush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			brush: true,
			motion: { type: 'spring' },
			padding: defaultChartPadding({ left: 25 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}