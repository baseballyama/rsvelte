import * as $ from 'svelte/internal/server';
import { defaultChartPadding, LinearGradient, LineChart, Spline } from 'layerchart';
import { ticks } from 'd3-array';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { getDailyTemperature } from '$lib/data.remote';

const data = await getDailyTemperature();

export default function Gradient_encoding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function marks($$renderer) {
				{
					function children($$renderer, { gradient }) {
						Spline($$renderer, { stroke: gradient });
					}

					LinearGradient($$renderer, {
						stops: ticks(1, 0, 10).map(interpolateTurbo),
						vertical: true,
						children,
						$$slots: { default: true }
					});
				}
			}

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				c: 'value',
				cScale: scaleSequential(interpolateTurbo),
				yDomain: null,
				padding: defaultChartPadding({ top: 40 }),
				height: 300,
				legend: { title: 'Temperature (°F)', placement: 'top-right' },
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}