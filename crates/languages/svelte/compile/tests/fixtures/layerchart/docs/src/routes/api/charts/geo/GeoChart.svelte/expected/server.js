import * as $ from 'svelte/internal/server';
import { ServerChart } from 'layerchart/server';
import { GeoPath } from 'layerchart/geo';

export default function GeoChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { states, projection, width, height, capture, onCapture } = $$props;

		ServerChart($$renderer, {
			capture,
			onCapture,
			width,
			height,
			geo: { projection, fitGeojson: states },
			padding: { top: 10, right: 10, bottom: 10, left: 10 },
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(states.features);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let feature = each_array[$$index];

					GeoPath($$renderer, {
						geojson: feature,
						fill: 'rgba(59, 130, 246, 0.15)',
						stroke: 'rgb(59, 130, 246)',
						strokeWidth: 0.5
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}