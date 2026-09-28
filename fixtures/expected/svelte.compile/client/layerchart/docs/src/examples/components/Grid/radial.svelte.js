import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Grid, Layer } from 'layerchart';

export default function Radial($$anchor, $$props) {
	$.push($$props, true);

	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		radial: true,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					Grid($$anchor, {
						x: true,
						xTicks: (scale) => scale.ticks?.().splice(1),
						y: true
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}