import * as $ from 'svelte/internal/server';
import { Chart, Grid, Layer } from 'layerchart';

export default function Padding($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 50, right: 50 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Grid($$renderer, { x: true, y: true });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}