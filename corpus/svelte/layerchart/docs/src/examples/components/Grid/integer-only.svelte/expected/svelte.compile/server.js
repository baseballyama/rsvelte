import * as $ from 'svelte/internal/server';
import { Axis, Chart, Grid, Layer, defaultChartPadding } from 'layerchart';

export default function Integer_only($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			yDomain: [0, 2],
			padding: defaultChartPadding({ top: 10, bottom: 10 }),
			height: 200,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Grid($$renderer, {
							y: true,
							yTicks: (scale) => scale.ticks?.().filter(Number.isInteger)
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'left',
							rule: true,
							ticks: (scale) => scale.ticks?.().filter(Number.isInteger),
							format: 'integer'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}