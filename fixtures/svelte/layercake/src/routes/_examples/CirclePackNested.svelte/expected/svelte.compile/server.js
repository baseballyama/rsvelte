import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import CirclePack from '../../_components/CirclePack.html.svelte';
import data from '../../_data/familyTree.csv';

export default function CirclePackNested($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const idKey = 'name';

	const parentKey = 'parent';

	$$renderer.push(`<div class="chart-container svelte-z9qnut">`);

	LayerCake($$renderer, {
		padding: { top: 0, bottom: 20, left: 30 },
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					CirclePack($$renderer, {
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

	$$renderer.push(`<!----></div>`);
}