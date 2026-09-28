import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import Scatter from '../../_components/Scatter.html.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-1ua1ha"><!></div>`);

export default function Scatter_1($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 4.5;
	const padding = 2.5;
	const fill = '#fff';
	const stroke = '#0cf';
	const strokeWidth = 1.5;
	var div = root_1();
	var node = $.child(div);

	LayerCake(node, {
		ssr: true,
		percentRange: true,
		padding: { top: 10, right: 5, bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					AxisX(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					AxisY(node_2, {});

					var node_3 = $.sibling(node_2, 2);

					Scatter(node_3, { r, fill, stroke, strokeWidth });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}