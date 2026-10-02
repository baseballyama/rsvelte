import * as $ from 'svelte/internal/server';
import { Axis, Chart, Contour, Layer } from 'layerchart';
import { getVolcano } from '$lib/data.remote.js';

const volcano = await getVolcano();

export default function Volcano_lines($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
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
							fill: 'none',
							stroke: 'oklch(0.7 0.15 260)',
							strokeWidth: 0.5,
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