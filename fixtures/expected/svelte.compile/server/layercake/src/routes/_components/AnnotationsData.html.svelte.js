import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import { scaleBand } from 'd3-scale';
import AnnotationsData from '../../_components/AnnotationsData.html.svelte';
import Column from '../../_components/Column.svelte';
import data from '../../_data/groups.csv';

export default function AnnotationsData_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'year';

		const yKey = 'value';

		const annotations = [
			{ text: 'Data-driven annotation', year: 1979, value: 15 },
			{ text: '...and another one', year: 1980, value: 12 }
		];

		$$renderer.push(`<div class="chart-container svelte-98zy5z">`);

		LayerCake($$renderer, {
			padding: { top: 0, right: 0, left: 20 },
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

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					children: ($$renderer) => {
						AnnotationsData($$renderer, { annotations });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}