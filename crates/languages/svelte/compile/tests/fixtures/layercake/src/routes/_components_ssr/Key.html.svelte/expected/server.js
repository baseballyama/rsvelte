import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import Key from '../../_components/Key.html.svelte';
import data from '../../_data/fruit.csv';

export default function Key_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'month';

		const yKey = [0, 1];
		const zKey = 'key';
		const parseDate = timeParse('%Y-%m-%d');
		const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
		const seriesColors = ['#ff00cc', '#ff7ac7', '#ffb3c0', '#ffe4b8'];

		data.forEach((d) => {
			d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];
		});

		$$renderer.push(`<div class="chart-container svelte-e5ssft">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			x: xKey,
			y: yKey,
			z: zKey,
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			data,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						Key($$renderer, { shape: 'square' });
						$$renderer.push(`<!----> <div class="padding svelte-e5ssft"></div> `);
						Key($$renderer, { shape: 'circle' });
						$$renderer.push(`<!----> <div class="padding svelte-e5ssft"></div> `);
						Key($$renderer, { shape: 'line' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}