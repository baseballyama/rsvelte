import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import { scaleBand } from 'd3-scale';
import AnnotationsData from '../../_components/AnnotationsData.html.svelte';
import Column from '../../_components/Column.svelte';
import data from '../../_data/groups.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-98zy5z"><!></div>`);

export default function AnnotationsData_html($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'year';

	const yKey = 'value';

	const annotations = [
		{ text: 'Data-driven annotation', year: 1979, value: 15 },
		{ text: '...and another one', year: 1980, value: 12 }
	];

	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.02).round(true));

		LayerCake(node, {
			padding: { top: 0, right: 0, left: 20 },
			x: xKey,
			y: yKey,
			get xScale() {
				return $.get($0);
			},
			xDomain: [1979, 1980, 1981, 1982, 1983],
			yDomain: [0, null],
			get data() {
				return data;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Svg(node_1, {
					children: ($$anchor, $$slotProps) => {
						Column($$anchor, {});
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Html(node_2, {
					children: ($$anchor, $$slotProps) => {
						AnnotationsData($$anchor, {
							get annotations() {
								return annotations;
							}
						});
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