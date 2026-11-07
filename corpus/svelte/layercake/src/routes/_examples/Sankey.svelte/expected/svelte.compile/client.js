import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import Sankey from '../../_components/Sankey.svelte';
import data from '../../_data/sankey-data.js';

var root = $.from_html(`<div class="chart-container svelte-bd2zso"><!></div>`);

export default function Sankey_1($$anchor) {
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Svg($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Sankey($$anchor, { colorNodes: (d) => '#00bbff', colorLinks: (d) => '#00bbff35' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}