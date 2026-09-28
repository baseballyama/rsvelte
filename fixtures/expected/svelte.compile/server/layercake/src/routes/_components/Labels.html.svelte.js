import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import Labels from '../../_components/Labels.html.svelte';
import data from '../../_data/points.csv';

export default function Labels_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'myX';

		const yKey = 'myY';

		const labels = data.filter((d, i) => {
			return i % 6 === 0;
		});

		$$renderer.push(`<div class="chart-container svelte-k48rey">`);

		LayerCake($$renderer, {
			padding: { top: 20, left: 10, right: 10 },
			x: xKey,
			y: yKey,
			data,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						Labels($$renderer, { getLabelName: (d) => d[xKey], labels });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}