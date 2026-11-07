import * as $ from 'svelte/internal/server';
import { scaleUtc } from 'd3-scale';
import { curveCatmullRom } from 'd3-shape';
import { Axis, Chart, Layer, Spline } from 'layerchart';
import { getDailyTemperatures } from '$lib/data.remote';

const data = await getDailyTemperatures();

export default function Radial_multi_year_lines($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Spline($$renderer, {
							curve: curveCatmullRom,
							class: (d) => d.year === 2024
								? 'stroke-primary'
								: d.year === 2023 ? 'stroke-primary/50' : 'stroke-surface-content',
							opacity: (d) => [2023, 2024].includes(d.year) ? 1 : context.zScale(d.year)
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'angle',
							tickLength: 0,
							grid: true,
							format: 'month'
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'radius',
							grid: true,
							rule: { y: '$top', class: 'stroke-surface-content/20' },
							ticks: 4,
							format: (v) => v + '° F'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'date',
				xScale: scaleUtc(),
				y: 'value',
				yRange: ({ height }) => [height / 5, height / 2],
				yPadding: [0, 20],
				z: 'year',
				zDomain: [1940, 2024],
				zRange: [0.1, 0.2],
				radial: true,
				padding: { top: 12, bottom: 12 },
				height: 500,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}