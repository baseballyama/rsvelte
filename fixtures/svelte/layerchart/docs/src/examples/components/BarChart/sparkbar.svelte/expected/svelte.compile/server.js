import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 20, max: 100 });

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			axis: false,
			grid: false,
			bandPadding: 0.1,
			props: { bars: { radius: 1, strokeWidth: 0 } },
			height: 18,
			width: 124
		});

		$.bind_props($$props, { data });
	});
}