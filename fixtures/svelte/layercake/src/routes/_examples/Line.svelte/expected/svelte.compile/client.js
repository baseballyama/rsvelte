import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import Line from '../../_components/Line.svelte';
import Area from '../../_components/Area.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-bce511"><!></div>`);

export default function Line_1($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	var div = root_1();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 8, right: 10, bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					AxisX(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					AxisY(node_2, { ticks: 4 });

					var node_3 = $.sibling(node_2, 2);

					Line(node_3, {});

					var node_4 = $.sibling(node_3, 2);

					Area(node_4, {});
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