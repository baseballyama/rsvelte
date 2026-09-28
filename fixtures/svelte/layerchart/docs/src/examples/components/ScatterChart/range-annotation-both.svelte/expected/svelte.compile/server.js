import * as $ from 'svelte/internal/server';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';

export default function Range_annotation_both($$renderer, $$props) {
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
					y: [230, 270],
					label: 'Range',
					labelPlacement: 'bottom',
					labelYOffset: -16,
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
				}
			],
			height: 400,
			padding: 24
		});

		$.bind_props($$props, { data });
	});
}