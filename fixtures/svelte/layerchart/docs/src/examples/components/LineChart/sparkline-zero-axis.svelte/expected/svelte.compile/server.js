import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkline_zero_axis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 50, min: 50, max: 100 });

		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			axis: false,
			grid: false,
			props: {
				highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
			},
			width: 124,
			height: 20
		});

		$.bind_props($$props, { data });
	});
}