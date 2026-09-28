import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { interpolateInferno } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Raster } from 'layerchart';

export default function Mandelbrot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function mandelbrot(x, y) {
			for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
				[zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];

				if (zr * zr + zi * zi > 4) return n;
			}

			return 0;
		}

		Chart($$renderer, {
			cScale: scaleSequential(interpolateInferno),
			xDomain: [-2, 1],
			yDomain: [-1.164, 1.164],
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			class: 'aspect-square',
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Raster($$renderer, { value: mandelbrot, pixelSize: 2 });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}