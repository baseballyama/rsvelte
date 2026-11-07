import 'svelte/internal/disclose-version';
import { getWind } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { max } from 'd3-array';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Vector, Tooltip } from 'layerchart';

const windData = await getWind();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Wind_map($$anchor, $$props) {
	$.push($$props, true);

	const wind = windData.map((d) => {
		const speed = Math.hypot(d.u, d.v);
		const angle = Math.atan2(d.u, d.v) * 180 / Math.PI;

		return { ...d, speed, angle };
	});

	const colorScale = scaleSequential(interpolateTurbo).domain([0, max(wind, (d) => d.speed)]);
	const data = { wind: windData };
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'bottom' });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'left' });

					var node_3 = $.sibling(node_2, 2);

					Vector(node_3, {
						x: 'longitude',
						y: 'latitude',
						length: 'speed',
						rotate: 'angle',
						anchor: 'middle',
						stroke: (d) => colorScale(d.speed),
						strokeWidth: 1
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_1();
					var node_5 = $.first_child(fragment_3);

					$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Wind');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var node_7 = $.first_child(fragment_4);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Speed (m/s)',
										get value() {
											return data().speed;
										},
										format: 'decimal'
									});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Direction',
										get value() {
											return data().angle;
										},
										format: 'decimal'
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return wind;
			},
			x: 'longitude',
			y: 'latitude',
			r: 'speed',
			rRange: [0, 20],
			padding: { top: 10, bottom: 10, left: 10, right: 10 },
			tooltipContext: { mode: 'quadtree' },
			height: 500,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}