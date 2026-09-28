import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import Sankey from '../../_components/Sankey.svelte';
import data from '../../_data/sankey-data.js';

export default function Sankey_1($$renderer) {
	$$renderer.push(`<div class="chart-container svelte-176z037">`);

	LayerCake($$renderer, {
		padding: { top: 10 },
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					Sankey($$renderer, { colorNodes: () => '#00bbff', colorLinks: () => '#00bbff35' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}