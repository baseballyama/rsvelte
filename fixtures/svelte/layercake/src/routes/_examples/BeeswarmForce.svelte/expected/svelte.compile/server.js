import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import Key from '../../_components/Key.html.svelte';
import AxisX from '../../_components/AxisX.svelte';
import Beeswarm from '../../_components/BeeswarmForce.svelte';
import data from '../../_data/us-senate.csv';

export default function BeeswarmForce($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'date_of_birth';

		const zKey = 'gender';
		const titleKey = 'name';
		const r = 6;
		const seriesColors = ['#fc0', '#000'];

		const dataTransformed = data.map((d) => {
			return {
				[titleKey]: d[titleKey],
				[zKey]: d[zKey],
				[xKey]: +d[xKey].split('-')[0]
			};
		});

		$$renderer.push(`<div class="chart-container svelte-11j8cgw">`);

		LayerCake($$renderer, {
			padding: { bottom: 15 },
			x: xKey,
			z: zKey,
			zScale: scaleOrdinal(),
			zRange: seriesColors,
			zDomainSort: true,
			data: dataTransformed,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, {});
						$$renderer.push(`<!----> `);

						Beeswarm($$renderer, {
							r,
							strokeWidth: 1,
							xStrength: 0.95,
							yStrength: 0.075,
							getTitle: (d) => d[titleKey]
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					pointerEvents: false,
					children: ($$renderer) => {
						Key($$renderer, { shape: 'circle' });
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