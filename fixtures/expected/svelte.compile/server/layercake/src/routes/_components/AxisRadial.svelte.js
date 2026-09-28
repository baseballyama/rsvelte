import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import AxisRadial from '../../_components/AxisRadial.svelte';
import data from '../../_data/radarScores.csv';

export default function AxisRadial_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const seriesKey = 'name';

		const xKey = ['fastball', 'change', 'slider', 'cutter', 'curve'];
		const seriesNames = Object.keys(data[0]).filter((d) => d !== seriesKey);
		const padding = 35;

		$$renderer.push(`<div class="chart-container svelte-151ny6y">`);

		LayerCake($$renderer, {
			padding: { top: padding, right: padding, bottom: padding, left: padding },
			x: xKey,
			xDomain: [0, 10],
			xRange: ({ height }) => [0, height / 2],
			data,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisRadial($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}