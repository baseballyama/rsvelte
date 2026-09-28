import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { scaleBand } from 'd3-scale';
import Bar from '../../_components/Bar.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/groups.csv';

export default function Bar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'value';

		const yKey = 'year';

		$$renderer.push(`<div class="chart-container svelte-clt9u6">`);

		LayerCake($$renderer, {
			padding: { bottom: 20, left: 35 },
			x: xKey,
			y: yKey,
			yScale: scaleBand().paddingInner(0.05),
			xDomain: [0, null],
			data,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { tickMarks: true, baseline: true, snapLabels: true });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { tickMarks: true, gridlines: false });
						$$renderer.push(`<!----> `);
						Bar($$renderer, {});
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