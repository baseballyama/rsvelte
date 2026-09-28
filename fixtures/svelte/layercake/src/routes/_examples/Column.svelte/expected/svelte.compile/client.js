import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import { scaleBand } from 'd3-scale';
import Column from '../../_components/Column.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import Annotations from '../../_components/AnnotationsData.html.svelte';
import Arrows from '../../_components/Arrows.svelte';
import ArrowheadMarker from '../../_components/ArrowheadMarker.svelte';
import data from '../../_data/groups.csv';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-1azi8o5"><!></div>`);

export default function Column_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'year';

	const yKey = 'value';

	const annotations = [
		{
			text: 'Example text...',
			[xKey]: 1980,
			[yKey]: 14,
			dx: 15, // Optional pixel values
			dy: -5,
			arrows: [
				{
					clockwise: false, // true or false, defaults to true
					source: {
						anchor: 'left-bottom', // can be `{left, middle, right},{top-middle-bottom}`
						dx: -2,
						dy: -7
					},
					target: {
						// These can be expressed in our data units if passed under the data keys
						[xKey]: 1980,
						[yKey]: 4.5,
						// Optional adjustments
						dx: 2,
						dy: 5
					}
				},

				{
					source: { anchor: 'right-bottom', dy: -7, dx: 5 },
					target: {
						// Or if they are percentage strings they can be passed directly
						x: '68%',
						y: '48%'
					}
				}
			]
		}
	];

	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.02).round(true));

		LayerCake(node, {
			padding: { top: 0, right: 0, bottom: 20, left: 20 },
			x: xKey,
			y: yKey,
			get xScale() {
				return $.get($0);
			},
			xDomain: [1979, 1980, 1981, 1982, 1983],
			yDomain: [0, null],
			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Svg(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						AxisX(node_2, { gridlines: false });

						var node_3 = $.sibling(node_2, 2);

						AxisY(node_3, { snapBaselineLabel: true });

						var node_4 = $.sibling(node_3, 2);

						Column(node_4, {});
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_1, 2);

				Html(node_5, {
					children: ($$anchor, $$slotProps) => {
						Annotations($$anchor, {
							get annotations() {
								return annotations;
							}
						});
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				{
					const defs = ($$anchor) => {
						ArrowheadMarker($$anchor, {});
					};

					Svg(node_6, {
						defs,
						children: ($$anchor, $$slotProps) => {
							Arrows($$anchor, {
								get annotations() {
									return annotations;
								}
							});
						},
						$$slots: { defs: true, default: true }
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}