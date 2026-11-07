import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Brush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		AreaChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			brush: true,
			motion: { type: 'spring' },
			props: {
				xAxis: { tickMultiline: true },
				canvas: { class: 'cursor-crosshair' },
				svg: { class: 'cursor-crosshair' }
			},
			padding: defaultChartPadding({ left: 25 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}