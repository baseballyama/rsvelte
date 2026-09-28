import * as $ from 'svelte/internal/server';
import { Axis, Chart, Grid, Layer } from 'layerchart';

export default function Tick_count_null($$renderer) {
	Chart($$renderer, {
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Grid($$renderer, { y: true, yTicks: null });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left', rule: true, ticks: null });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}