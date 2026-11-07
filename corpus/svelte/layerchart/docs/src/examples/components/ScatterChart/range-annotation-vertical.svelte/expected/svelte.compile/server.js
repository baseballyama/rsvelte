import * as $ from 'svelte/internal/server';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';

export default function Range_annotation_vertical($$renderer, $$props) {
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
			annotations: [
				{
					type: 'range',
					layer: 'below',
					x: [230, 270],
					label: 'Range',
					labelPlacement: 'bottom',
					labelYOffset: 4,
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.3 } }
				}
			],
			padding: 24,
			height: 400
		});

		$.bind_props($$props, { data });
	});
}