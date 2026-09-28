import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Grid, Layer } from 'layerchart';

export default function Padding($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 50, right: 50 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Grid($$anchor, { x: true, y: true });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}