import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import Key from '../../_components/Key.html.svelte';
import data from '../../_data/fruit.csv';

var root = $.from_html(`<!> <div class="padding svelte-e5ssft"></div> <!> <div class="padding svelte-e5ssft"></div> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-e5ssft"><!></div>`);

export default function Key_html($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'month';

	const yKey = [0, 1];
	const zKey = 'key';
	const parseDate = timeParse('%Y-%m-%d');
	const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
	const seriesColors = ['#ff00cc', '#ff7ac7', '#ffb3c0', '#ffe4b8'];

	data.forEach((d) => {
		d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];
	});

	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleOrdinal);

		LayerCake(node, {
			padding: { top: 10 },
			x: xKey,
			get y() {
				return yKey;
			},
			z: zKey,
			get zScale() {
				return $.get($0);
			},

			get zDomain() {
				return seriesNames;
			},

			get zRange() {
				return seriesColors;
			},

			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				Html($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						Key(node_1, { shape: 'square' });

						var node_2 = $.sibling(node_1, 4);

						Key(node_2, { shape: 'circle' });

						var node_3 = $.sibling(node_2, 4);

						Key(node_3, { shape: 'line' });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}