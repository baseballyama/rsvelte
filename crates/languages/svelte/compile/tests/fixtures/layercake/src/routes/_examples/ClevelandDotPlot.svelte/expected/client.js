import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import ClevelandDotPlot from '../../_components/ClevelandDotPlot.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/fruitOrdinal.csv';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-1t5cdoh"><!></div>`);

export default function ClevelandDotPlot_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const yKey = 'year';

	const xKey = Object.keys(data[0]).filter((d) => d !== yKey);
	const seriesColors = ['#f0c', '#00bbff', '#00e047', '#ff7a33'];
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.05).round(true));
		let $1 = $.derived(scaleOrdinal);

		LayerCake(node, {
			padding: { right: 10, bottom: 20, left: 30 },
			get x() {
				return xKey;
			},
			y: yKey,
			get yScale() {
				return $.get($0);
			},
			yDomainSort: true,
			xDomain: [0, null],
			xPadding: [10, 0],
			get zScale() {
				return $.get($1);
			},

			get zDomain() {
				return xKey;
			},

			get zRange() {
				return seriesColors;
			},

			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						AxisX(node_1, {});

						var node_2 = $.sibling(node_1, 2);

						AxisY(node_2, { gridlines: false });

						var node_3 = $.sibling(node_2, 2);

						ClevelandDotPlot(node_3, {});
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