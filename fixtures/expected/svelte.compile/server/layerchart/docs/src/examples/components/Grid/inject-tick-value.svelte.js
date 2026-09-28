import * as $ from 'svelte/internal/server';
import { Axis, Chart, Grid, Layer } from 'layerchart';

export default function Inject_tick_value($$renderer) {
	Chart($$renderer, {
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Grid($$renderer, { y: true, yTicks: (scale) => [45, ...scale.ticks?.() ?? []] });
					$$renderer.push(`<!----> `);

					Axis($$renderer, {
						placement: 'left',
						rule: true,
						ticks: (scale) => [45, ...scale.ticks?.() ?? []]
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}