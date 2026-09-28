import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import CirclePack from '../../_components/CirclePack.html.svelte';
import data from '../../_data/fruitGroups.csv';

export default function CirclePack_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	/** @type {string} */
	const idKey = 'fruit';

	/** @type {string} */
	const valueKey = 'value';

	$$renderer.push(`<div class="chart-container svelte-110ams8">`);

	LayerCake($$renderer, {
		padding: { top: 0, bottom: 20, left: 30 },
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					CirclePack($$renderer, {
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

	$$renderer.push(`<!----></div>`);
}