import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import Beeswarm from '../../_components/Beeswarm.svelte';
import data from '../../_data/cars-2.csv';

export default function Beeswarm_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'Weight_in_lbs';

		const zKey = 'Origin';
		const titleKey = 'Name';
		const r = 4;
		const seriesNames = new Set();
		const seriesColors = ['#ccc', '#fc0', '#000'];

		const dataTransformed = data.map((d) => {
			seriesNames.add(d[zKey]);

			return { [titleKey]: d[titleKey], [xKey]: +d[xKey], [zKey]: d[zKey] };
		});

		$$renderer.push(`<div class="chart-container svelte-1x0wtd8">`);

		{
			function children($$renderer, { width }) {
				Svg($$renderer, {
					children: ($$renderer) => {
						Beeswarm($$renderer, {
							r: width < 400 ? r / 1.6 : r,
							spacing: 1,
							getTitle: (d) => d.data[titleKey]
						});
					},
					$$slots: { default: true }
				});
			}

			LayerCake($$renderer, {
				x: xKey,
				z: zKey,
				zScale: scaleOrdinal(),
				zDomain: [...seriesNames].sort(),
				zRange: seriesColors,
				data: dataTransformed,
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}