import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import { scaleBand } from 'd3-scale';
import Bar from '../../_components/Bar.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import data from '../../_data/groups.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-qwqn99"><!></div>`);

export default function Bar_1($$anchor, $$props) {
	$.push($$props, true);

	var // This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	div = root_1();

	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.05).round(true));

		LayerCake(node, {
			ssr: true,
			percentRange: true,
			padding: { top: 0, right: 20, bottom: 20, left: 35 },
			x: 'value',
			y: 'year',
			get yScale() {
				return $.get($0);
			},
			yDomain: [1979, 1980, 1981, 1982, 1983],
			xDomain: [0, null],
			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Html(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						AxisX(node_2, { gridlines: true, baseline: true, snapLabels: true });

						var node_3 = $.sibling(node_2, 2);

						AxisY(node_3, { gridlines: false, tickMarks: true });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_1, 2);

				ScaledSvg(node_4, {
					children: ($$anchor, $$slotProps) => {
						Bar($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}