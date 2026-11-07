import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import Beeswarm from '../../_components/BeeswarmForce.svelte';
import data from '../../_data/us-senate.csv';

export default function BeeswarmForce($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'date_of_birth';

		const zKey = 'gender';
		const titleKey = 'name';
		const r = 6;
		const seriesNames = new Set();
		const seriesColors = ['#fc0', '#000'];

		const dataTransformed = data.map((d) => {
			seriesNames.add(d[zKey]);

			return {
				[titleKey]: d[titleKey],
				[zKey]: d[zKey],
				[xKey]: +d[xKey].split('-')[0]
			};
		});

		$$renderer.push(`<div class="chart-container svelte-1ksd9gb">`);

		{
			function children($$renderer, { width }) {
				Svg($$renderer, {
					children: ($$renderer) => {
						Beeswarm($$renderer, {
							r: width < 400 ? r / 1.25 : r,
							strokeWidth: 1,
							xStrength: 0.95,
							yStrength: 0.075,
							getTitle: (d) => d[titleKey]
						});
					},
					$$slots: { default: true }
				});
			}

			LayerCake($$renderer, {
				padding: { left: 10, bottom: 15 },
				x: xKey,
				z: zKey,
				zScale: scaleOrdinal(),
				zDomain: Array.from(seriesNames),
				zRange: seriesColors,
				data: dataTransformed,
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}