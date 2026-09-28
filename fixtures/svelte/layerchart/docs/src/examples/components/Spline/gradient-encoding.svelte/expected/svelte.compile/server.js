import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { extent, ticks } from 'd3-array';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Legend, LinearGradient, Spline } from 'layerchart';
import { getDailyTemperature } from '$lib/data.remote';

const data = await getDailyTemperature();

export default function Gradient_encoding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const temperatureColor = scaleSequential(extent(data, (d) => d.value), interpolateTurbo);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yNice: true,
			padding: { top: 25, left: 16, bottom: 25 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { gradient }) {
								Spline($$renderer, { class: 'stroke-2', stroke: gradient });
							}

							LinearGradient($$renderer, {
								stops: ticks(1, 0, 10).map(temperatureColor.interpolator()),
								vertical: true,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Legend($$renderer, {
					scale: temperatureColor,
					title: 'Temperature (°F)',
					placement: 'top-right',
					width: 240,
					class: '-top-[14px]'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}