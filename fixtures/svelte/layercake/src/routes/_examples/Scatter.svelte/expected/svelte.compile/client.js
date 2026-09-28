import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Canvas } from 'layercake';
import ScatterSvg from '../../_components/Scatter.svg.svelte';
import ScatterCanvas from '../../_components/Scatter.canvas.svelte';
import Voronoi from '../../_components/Voronoi.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="chart-container svelte-1jw6oh1"><!></div>`);

export default function Scatter($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 10;
	const color = '#fff';

	function logEvent(d) {
		console.log('dispatched event', d, d.detail);
	}

	var div = root_2();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 10, right: 5, bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			Svg(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					AxisX(node_2, { gridlines: false });

					var node_3 = $.sibling(node_2, 2);

					AxisY(node_3, { gridlines: false, ticks: 4 });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Canvas(node_4, {
				children: ($$anchor, $$slotProps) => {
					ScatterCanvas($$anchor, { r: r * 1.5, fill: '#0cf' });
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Svg(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_6 = $.first_child(fragment_3);

					ScatterSvg(node_6, { r, fill: color });

					var node_7 = $.sibling(node_6, 2);

					Voronoi(node_7, { stroke: '#333', onmouseover: logEvent });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}