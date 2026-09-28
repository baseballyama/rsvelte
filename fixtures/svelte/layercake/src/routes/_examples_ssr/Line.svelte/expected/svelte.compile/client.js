import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import Line from '../../_components/Line.svelte';
import Area from '../../_components/Area.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-1sny1n2"><!></div>`);

export default function Line_1($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	var div = root_1();
	var node = $.child(div);

	LayerCake(node, {
		ssr: true,
		percentRange: true,
		padding: { top: 8, right: 10, bottom: 20, left: 25 },
		x: xKey,
		y: (d) => d[yKey],
		yDomain: [0, null],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Html(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					AxisX(node_2, {});

					var node_3 = $.sibling(node_2, 2);

					AxisY(node_3, { ticks: 4 });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			ScaledSvg(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					Line(node_5, {});

					var node_6 = $.sibling(node_5, 2);

					Area(node_6, {});
					$.append($$anchor, fragment_2);
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