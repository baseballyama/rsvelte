import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import Line from '../../_components/Line.svelte';
import Area from '../../_components/Area.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import Brush from '../../_components/Brush.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="brushed-chart-container svelte-1dfwdn3"><!></div> <div class="brush-container svelte-1dfwdn3"><!></div>`, 1);

export default function Brush_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	let brushExtents = $.proxy([null, null]);

	const xKey = 'myX';
	const yKey = 'myY';

	let brushedData = $.derived(() => {
		let selection = data.slice((brushExtents[0] || 0) * data.length, (brushExtents[1] || 1) * data.length);

		if (selection.length < 2 && brushExtents[0] !== null) {
			selection = data.slice(brushExtents[0] * data.length, brushExtents[0] * data.length + 2);
		}

		return selection;
	});

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	LayerCake(node, {
		padding: { bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		get data() {
			return $.get(brushedData);
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					AxisX(node_1, {
						ticks: (ticks) => {
							const filtered = ticks.filter((t) => t % 1 === 0);

							if (filtered.length > 7) {
								return filtered.filter((t, i) => i % 2 === 0);
							}

							return filtered;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					AxisY(node_2, { ticks: 4 });

					var node_3 = $.sibling(node_2, 2);

					Line(node_3, { stroke: '#00e047' });

					var node_4 = $.sibling(node_3, 2);

					Area(node_4, { fill: '#00e04710' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_5 = $.child(div_1);

	LayerCake(node_5, {
		padding: { top: 5 },
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_6 = $.first_child(fragment_3);

			Svg(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_7 = $.first_child(fragment_4);

					Line(node_7, { stroke: '#00e047' });

					var node_8 = $.sibling(node_7, 2);

					Area(node_8, { fill: '#00e04710' });
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_6, 2);

			Html(node_9, {
				children: ($$anchor, $$slotProps) => {
					Brush($$anchor, {
						get min() {
							return brushExtents[0];
						},

						set min($$value) {
							brushExtents[0] = $$value;
						},

						get max() {
							return brushExtents[1];
						},

						set max($$value) {
							brushExtents[1] = $$value;
						}
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}