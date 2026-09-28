import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { scaleBand } from 'd3-scale';
import Bar from '../../_components/Bar.svelte';
import data from '../../_data/groups.csv';

export default function Bar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'value';

		const yKey = 'year';

		$$renderer.push(`<div class="chart-container svelte-ss85kl">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			x: xKey,
			y: yKey,
			yScale: scaleBand().paddingInner(0.05).round(true),
			yDomain: [1979, 1980, 1981, 1982, 1983],
			xDomain: [0, null],
			data,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						Bar($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}