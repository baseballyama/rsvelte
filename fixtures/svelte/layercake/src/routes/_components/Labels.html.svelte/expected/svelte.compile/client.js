import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import Labels from '../../_components/Labels.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="chart-container svelte-k48rey"><!></div>`);

export default function Labels_html($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';

	const labels = data.filter((d, i) => {
		return i % 6 === 0;
	});

	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 20, left: 10, right: 10 },
		x: xKey,
		y: yKey,
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Labels($$anchor, {
						getLabelName: (d) => d[xKey],
						get labels() {
							return labels;
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
	$.pop();
}