import * as $ from 'svelte/internal/server';
import { Chart, Grid, Layer } from 'layerchart';

export default function X_only($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Grid($$renderer, { x: true });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}