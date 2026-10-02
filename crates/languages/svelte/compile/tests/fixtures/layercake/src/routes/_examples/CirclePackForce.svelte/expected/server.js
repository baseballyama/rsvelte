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
		const seriesColors = ['#f0c', '#0cf', '#fc0'];
		let manyBodyStrength = 3;
		let xStrength = 0.1;

		$$renderer.push(`<div class="input-container"><label class="svelte-1plzy2b"><input type="radio"${$.attr('checked', groupBy === 'true', true)} value="true" class="svelte-1plzy2b"/>Group by category</label> <label class="svelte-1plzy2b"><input type="radio"${$.attr('checked', groupBy === 'false', true)} value="false" class="svelte-1plzy2b"/>Clump together</label></div> <div class="chart-container svelte-1plzy2b">`);

		LayerCake($$renderer, {
			data,
			x: xKey,
			r: rKey,
			z: zKey,
			xScale: scaleBand(),
			rRange: [3, 12],
			zScale: scaleOrdinal(),
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