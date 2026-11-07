import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleSequential } from 'd3-scale';
import { interpolateInferno } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Raster } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Mandelbrot($$anchor, $$props) {
	$.push($$props, true);

	function mandelbrot(x, y) {
		for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
			[zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];

			if (zr * zr + zi * zi > 4) return n;
		}

		return 0;
	}

	{
		let $0 = $.derived(() => scaleSequential(interpolateInferno));

		Chart($$anchor, {
			get cScale() {
				return $.get($0);
			},
			xDomain: [-2, 1],
			yDomain: [-1.164, 1.164],
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			class: 'aspect-square',
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

						var node_2 = $.sibling(node_1, 2);

						Raster(node_2, { value: mandelbrot, pixelSize: 2 });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}