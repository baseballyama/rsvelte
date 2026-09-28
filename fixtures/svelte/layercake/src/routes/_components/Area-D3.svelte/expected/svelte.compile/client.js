import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { curveCardinal } from 'd3-shape';
import Area from '../../_components/Area-D3.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="chart-container svelte-1f9eob1"><!></div>`);

export default function Area_D3($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Area($$anchor, {
						fill: '#f0c',
						get curve() {
							return curveCardinal;
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}