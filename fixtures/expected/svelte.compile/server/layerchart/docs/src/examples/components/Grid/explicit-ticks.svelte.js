import * as $ from 'svelte/internal/server';
import { Axis, Chart, Grid, Layer } from 'layerchart';

export default function Explicit_ticks($$renderer) {
	Chart($$renderer, {
		yDomain: [0, 100],
		padding: { left: 20 },
		height: 200,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Grid($$renderer, { y: true, yTicks: [0, 25, 50, 75, 100] });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left', rule: true, ticks: [0, 50, 100] });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}