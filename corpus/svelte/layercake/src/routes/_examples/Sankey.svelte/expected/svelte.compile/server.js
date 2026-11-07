import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import Sankey from '../../_components/Sankey.svelte';
import data from '../../_data/sankey-data.js';

export default function Sankey_1($$renderer) {
	$$renderer.push(`<div class="chart-container svelte-bd2zso">`);

	LayerCake($$renderer, {
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					Sankey($$renderer, { colorNodes: (d) => '#00bbff', colorLinks: (d) => '#00bbff35' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}