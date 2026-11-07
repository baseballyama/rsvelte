import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { scaleOrdinal, scaleBand } from 'd3-scale';
import ForceLayout from '../../_components/CirclePackForce.svelte';
import data from '../../_data/dots.json';

export default function CirclePackForce($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const xKey = 'category';
		const rKey = 'value';
		const zKey = 'category';
		let groupBy = 'true';
		const seriesNameSet = new Set();
		const seriesColors = ['#f0c', '#0cf', '#fc0'];

		data.forEach((d) => {
			seriesNameSet.add(d[zKey]);
		});

		/* --------------------------------------------
		 * Convert this to an array so we can use it in our scales
		 */
		const seriesNames = [...seriesNameSet];

		let manyBodyStrength = 3;
		let xStrength = 0.1;

		$$renderer.push(`<div class="input-container"><label class="svelte-215hks"><input type="radio"${$.attr('checked', groupBy === 'true', true)} value="true" class="svelte-215hks"/>GroupBy \`true\`</label> <label class="svelte-215hks"><input type="radio"${$.attr('checked', groupBy === 'false', true)} value="false" class="svelte-215hks"/>GroupBy \`false\`</label></div> <div class="chart-container svelte-215hks">`);

		LayerCake($$renderer, {
			data,
			x: xKey,
			r: rKey,
			z: zKey,
			xScale: scaleBand(),
			xDomain: seriesNames,
			rRange: [3, 12],
			zScale: scaleOrdinal(),
			zDomain: seriesNames,
			zRange: seriesColors,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						ForceLayout($$renderer, {
							manyBodyStrength,
							xStrength,
							groupBy: JSON.parse(groupBy),
							nodeStroke: '#000'
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}