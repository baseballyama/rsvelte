import * as $ from 'svelte/internal/server';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';

export default function Brush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = getSpiral({
			angle: 137.5,
			radius: 10,
			count: 100,
			width: 500,
			height: 500
		});

		ScatterChart($$renderer, {
			data,
			xNice: true,
			x: 'x',
			y: 'y',
			props: {
				points: { motion: { type: 'tween', duration: 200 } },
				xAxis: { motion: { type: 'tween', duration: 200 } },
				yAxis: { motion: { type: 'tween', duration: 200 } }
			},
			brush: true,
			padding: 24,
			height: 400
		});

		$.bind_props($$props, { data });
	});
}