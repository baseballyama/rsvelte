import * as $ from 'svelte/internal/server';
import { AreaChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		AreaChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			axis: false,
			grid: false,
			props: {
				highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
			},
			width: 124,
			height: 24
		});

		$.bind_props($$props, { data });
	});
}