import 'svelte/internal/disclose-version';
import { getDailyTemperature } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { defaultChartPadding, LinearGradient, LineChart, Spline } from 'layerchart';
import { ticks } from 'd3-array';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';

const data = await getDailyTemperature();

export default function Gradient_encoding($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const marks = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;

					Spline($$anchor, {
						get stroke() {
							return gradient();
						}
					});
				};

				let $0 = $.derived(() => ticks(1, 0, 10).map(interpolateTurbo));

				LinearGradient($$anchor, {
					get stops() {
						return $.get($0);
					},
					vertical: true,
					children,
					$$slots: { default: true }
				});
			}
		};

		let $0 = $.derived(() => scaleSequential(interpolateTurbo));
		let $1 = $.derived(() => defaultChartPadding({ top: 40 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			yDomain: null,
			get padding() {
				return $.get($1);
			},
			height: 300,
			legend: { title: 'Temperature (°F)', placement: 'top-right' },
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}