import * as $ from 'svelte/internal/server';
import { Chart, Grid, Layer } from 'layerchart';

export default function Radial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			xDomain: [0, 100],
			yDomain: [0, 100],
			radial: true,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Grid($$renderer, {
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
	});
}