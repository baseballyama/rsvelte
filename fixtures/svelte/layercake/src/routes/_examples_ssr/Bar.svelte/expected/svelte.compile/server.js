import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import { scaleBand } from 'd3-scale';
import Bar from '../../_components/Bar.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import data from '../../_data/groups.csv';

export default function Bar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="chart-container svelte-qwqn99">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			padding: // This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
			{ top: 0, right: 20, bottom: 20, left: 35 },
			x: 'value',
			y: 'year',
			yScale: scaleBand().paddingInner(0.05).round(true),
			yDomain: [1979, 1980, 1981, 1982, 1983],
			xDomain: [0, null],
			data,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { gridlines: true, baseline: true, snapLabels: true });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { gridlines: false, tickMarks: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						Bar($$renderer, {});
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