import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Raster } from 'layerchart';

export default function Sampled($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			cScale: scaleSequential(interpolateRdBu),
			xDomain: [0, 6 * Math.PI],
			yDomain: [0, 4 * Math.PI],
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 400,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Raster($$renderer, { value: (x, y) => Math.sin(x) * Math.cos(y) });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}