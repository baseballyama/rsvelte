import * as $ from 'svelte/internal/server';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';

export default function Single_axis_y($$renderer, $$props) {
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
			axis: 'y',
			padding: 24,
			height: 400
		});

		$.bind_props($$props, { data });
	});
}