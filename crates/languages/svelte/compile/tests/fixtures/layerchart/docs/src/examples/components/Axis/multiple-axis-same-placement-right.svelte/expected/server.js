import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { range } from 'd3-array';

export default function Multiple_axis_same_placement_right($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							label: 'Celsius',
							scale: scaleLinear([0, 100], [context.height, 0]),
							placement: 'right',
							rule: true,
							labelProps: { dx: -60 }
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							label: 'Fahrenheit',
							scale: scaleLinear([32, 212], [context.height, 0]),
							ticks: range(0, 100 + 1, 10).map((x) => x * (9 / 5) + 32),
							placement: 'right',
							rule: true,
							x: 50,
							labelProps: { dx: -50 }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				yDomain: [0, 100],
				padding: defaultChartPadding({ right: 90 }),
				height: 300,
				children,
				$$slots: { default: true }
			});
		}
	});
}