import 'svelte/internal/disclose-version';
import { getDailyTemperature } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { scaleSequential } from 'd3-scale';
import { extent, ticks } from 'd3-array';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Legend, LinearGradient, Spline } from 'layerchart';

const data = await getDailyTemperature();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Gradient_encoding($$anchor, $$props) {
	$.push($$props, true);

	const temperatureColor = scaleSequential(extent(data, (d) => d.value), interpolateTurbo);
	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yNice: true,
		padding: { top: 25, left: 16, bottom: 25 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Spline($$anchor, {
								class: 'stroke-2',
								get stroke() {
									return gradient();
								}
							});
						};

						let $0 = $.derived(() => ticks(1, 0, 10).map(temperatureColor.interpolator()));

						LinearGradient(node_3, {
							get stops() {
								return $.get($0);
							},
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			Legend(node_4, {
				get scale() {
					return temperatureColor;
				},
				title: 'Temperature (°F)',
				placement: 'top-right',
				width: 240,
				class: '-top-[14px]'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}