import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Grid, Layer } from 'layerchart';

export default function X_only($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Grid($$anchor, { x: true });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}