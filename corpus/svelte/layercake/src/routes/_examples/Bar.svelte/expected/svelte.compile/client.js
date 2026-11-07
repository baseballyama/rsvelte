import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg } from 'layercake';
import { scaleBand } from 'd3-scale';
import Bar from '../../_components/Bar.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/groups.csv';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-clt9u6"><!></div>`);

export default function Bar_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'value';

	const yKey = 'year';
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.05));

		LayerCake(node, {
			padding: { bottom: 20, left: 35 },
			x: xKey,
			y: yKey,
			get yScale() {
				return $.get($0);
			},
			xDomain: [0, null],
			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						AxisX(node_1, { tickMarks: true, baseline: true, snapLabels: true });

						var node_2 = $.sibling(node_1, 2);

						AxisY(node_2, { tickMarks: true, gridlines: false });

						var node_3 = $.sibling(node_2, 2);

						Bar(node_3, {});
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