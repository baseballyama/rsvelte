import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Axis, Chart, Contour, Layer } from 'layerchart';
import { getVolcano } from '$lib/data.remote.js';

const volcano = await getVolcano();

export default function Volcano_filled($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			cScale: scaleSequential(interpolateTurbo),
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 400,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Contour($$renderer, {
							data: volcano.values,
							width: volcano.width,
							height: volcano.height,
							thresholds: 20
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}