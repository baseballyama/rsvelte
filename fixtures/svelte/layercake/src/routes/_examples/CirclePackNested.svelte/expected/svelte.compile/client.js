import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import CirclePack from '../../_components/CirclePack.html.svelte';
import data from '../../_data/familyTree.csv';

var root = $.from_html(`<div class="chart-container svelte-z9qnut"><!></div>`);

export default function CirclePackNested($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const idKey = 'name';

	const parentKey = 'parent';
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 0, bottom: 20, left: 30 },
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					CirclePack($$anchor, {
						idKey,
						parentKey,
						spacing: 5,
						sortBy: (a, b) => b.depth - a.depth,
						labelVisibilityThreshold: (r) => false,
						stroke: '#00bbff'
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