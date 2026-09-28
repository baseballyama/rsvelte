import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import CirclePack from '../../_components/CirclePack.html.svelte';
import data from '../../_data/fruitGroups.csv';

var root = $.from_html(`<div class="chart-container svelte-1rrvpw3"><!></div>`);

export default function CirclePack_1($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const idKey = 'fruit';

	const valueKey = 'value';
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 10, bottom: 20, left: 30 },
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					CirclePack($$anchor, {
						idKey,
						valueKey,
						fill: '#ff00cc',
						stroke: '#9f0080',
						textColor: '#61004e',
						textStroke: '#ffdbf8',
						textStrokeWidth: 1
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