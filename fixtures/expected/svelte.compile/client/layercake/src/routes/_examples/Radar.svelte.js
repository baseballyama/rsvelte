import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import Radar from '../../_components/Radar.svelte';
import AxisRadial from '../../_components/AxisRadial.svelte';
import data from '../../_data/radarScores.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-3j0otj"><!></div>`);

export default function Radar_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const seriesKey = 'name';

	const xKey = ['fastball', 'change', 'slider', 'cutter', 'curve'];
	const seriesNames = Object.keys(data[0]).filter((d) => d !== seriesKey);
	var div = root_1();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 30, right: 0, bottom: 7, left: 0 },
		get x() {
			return xKey;
		},
		xDomain: [0, 10],
		xRange: ({ height }) => [0, height / 2],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					AxisRadial(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					Radar(node_2, {});
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}