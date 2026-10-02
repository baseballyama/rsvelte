import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { scaleBand } from 'd3-scale';
import Column from '../../_components/Column.svelte';
import data from '../../_data/groups.csv';

export default function Column_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'year';

		const yKey = 'value';

		$$renderer.push(`<div class="chart-container svelte-11ye0du">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			x: xKey,
			y: yKey,
			xScale: scaleBand().paddingInner(0.02).round(true),
			xDomain: [1979, 1980, 1981, 1982, 1983],
			yDomain: [0, null],
			data,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						Column($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}