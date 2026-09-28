import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import { format } from 'd3-format';
import { scaleOrdinal } from 'd3-scale';
import Key from '../../_components/Key.html.svelte';
import AxisX from '../../_components/AxisX.svelte';
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

		const addCommas = format(',');

		$$renderer.push(`<div class="chart-container svelte-o51j4z">`);

		{
			function children($$renderer, { width }) {
				Svg($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { baseline: true, format: addCommas, tickMarks: true });
						$$renderer.push(`<!----> `);

						Beeswarm($$renderer, {
							r: width < 400 ? r / 1.6 : r,
							spacing: 1,
							getTitle: (d) => d.data[titleKey]
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					pointerEvents: false,
					children: ($$renderer) => {
						Key($$renderer, { align: 'end', shape: 'circle', lookup: { USA: 'U.S.' } });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LayerCake($$renderer, {
				padding: { bottom: 15 },
				x: xKey,
				z: zKey,
				zScale: scaleOrdinal(),
				zRange: seriesColors,
				zDomainSort: true,
				data: dataTransformed,
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}