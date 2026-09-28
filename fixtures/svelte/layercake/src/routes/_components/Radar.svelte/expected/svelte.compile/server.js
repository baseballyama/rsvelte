import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import Radar from '../../_components/Radar.svelte';
import data from '../../_data/radarScores.csv';

export default function Radar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const seriesKey = 'name';

		const xKey = ['fastball', 'change', 'slider', 'cutter', 'curve'];
		const seriesNames = Object.keys(data[0]).filter((d) => d !== seriesKey);

		$$renderer.push(`<div class="chart-container svelte-twr4qw">`);

		LayerCake($$renderer, {
			x: xKey,
			xDomain: [0, 10],
			xRange: ({ height }) => [0, height / 2],
			data,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						Radar($$renderer, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}