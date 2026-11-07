import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import Line from '../../_components/Line.svelte';
import Area from '../../_components/Area.svelte';
import Brush from '../../_components/Brush.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="brushed-chart-container svelte-cst434"><!></div> <div class="brush-container svelte-cst434"><!></div>`, 1);

export default function Brush_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	let brushExtents = $.proxy([null, null]);

	const xKey = 'myX';
	const yKey = 'myY';
	let brushedData = $.state(void 0);

	$.user_effect(() => {
		$.set(brushedData, data.slice((brushExtents[0] || 0) * data.length, (brushExtents[1] || 1) * data.length), true);
	});

	$.user_effect(() => {
		if ($.get(brushedData).length < 2 && brushExtents[0] !== null) {
			$.set(brushedData, data.slice(brushExtents[0] * data.length, brushExtents[0] * data.length + 2), true);
		}
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 20, bottom: 20 },
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

					Line(node_1, { stroke: '#00e047' });

					var node_2 = $.sibling(node_1, 2);

					Area(node_2, { fill: '#00e04710' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.child(div_1);

	LayerCake(node_3, {
		padding: { top: 5 },
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_4 = $.first_child(fragment_3);

			Svg(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_5 = $.first_child(fragment_4);

					Line(node_5, { stroke: '#00e047' });

					var node_6 = $.sibling(node_5, 2);

					Area(node_6, { fill: '#00e04710' });
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Html(node_7, {
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