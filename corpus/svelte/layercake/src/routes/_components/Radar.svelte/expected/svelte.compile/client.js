import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import Radar from '../../_components/Radar.svelte';
import data from '../../_data/radarScores.csv';

var root = $.from_html(`<div class="chart-container svelte-twr4qw"><!></div>`);

export default function Radar_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const seriesKey = 'name';

	const xKey = ['fastball', 'change', 'slider', 'cutter', 'curve'];
	const seriesNames = Object.keys(data[0]).filter((d) => d !== seriesKey);
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
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
					Radar($$anchor, {});
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