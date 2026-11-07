import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import Line from '../../_components/Line.svelte';
import Area from '../../_components/Area.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import Brush from '../../_components/Brush.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="brushed-chart-container svelte-npdbrc"><!></div> <div class="brush-container svelte-npdbrc"><!></div>`, 1);

export default function Brush_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	let brushExtents = $.proxy([null, null]);

	const xKey = 'myX';
	const yKey = 'myY';

	let brushedData = $.derived(() => {
		const slicedData = data.slice((brushExtents[0] || 0) * data.length, (brushExtents[1] || 1) * data.length);

		if (slicedData.length < 2 && brushExtents[0] !== null) {
			return data.slice(brushExtents[0] * data.length, brushExtents[0] * data.length + 2);
		}

		return slicedData;
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	LayerCake(node, {
		ssr: true,
		percentRange: true,
		padding: { bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		get data() {
			return $.get(brushedData);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Html(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					AxisX(node_2, {
						ticks: (ticks) => {
							const filtered = ticks.filter((t) => t % 1 === 0);

							if (filtered.length > 7) {
								return filtered.filter((t, i) => i % 2 === 0);
							}

							return filtered;
						}
					});

					var node_3 = $.sibling(node_2, 2);

					AxisY(node_3, { ticks: 4 });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			ScaledSvg(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					Line(node_5, { stroke: '#00e047' });

					var node_6 = $.sibling(node_5, 2);

					Area(node_6, { fill: '#00e04710' });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_7 = $.child(div_1);

	LayerCake(node_7, {
		ssr: true,
		percentRange: true,
		padding: { top: 5 },
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_8 = $.first_child(fragment_4);

			ScaledSvg(node_8, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_9 = $.first_child(fragment_5);

					Line(node_9, { stroke: '#00e047' });

					var node_10 = $.sibling(node_9, 2);

					Area(node_10, { fill: '#00e04710' });
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_8, 2);

			Html(node_11, {
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

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}