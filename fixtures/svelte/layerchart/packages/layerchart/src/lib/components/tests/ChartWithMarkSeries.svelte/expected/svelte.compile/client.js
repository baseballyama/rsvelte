import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';
import Spline from '../Spline/Spline.svelte';
import Legend from '../Legend.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function ChartWithMarkSeries($$anchor) {
	// Long rows coloured by `c`, plus a line with its own data — which registers as a series
	// named `target`, competing with the `c` categories for the legend
	const data = [
		{ month: 'Jan', fruit: 'apples', value: 30 },
		{ month: 'Jan', fruit: 'bananas', value: 20 },
		{ month: 'Feb', fruit: 'apples', value: 40 },
		{ month: 'Feb', fruit: 'bananas', value: 10 }
	];

	const targets = [{ month: 'Jan', target: 80 }, { month: 'Feb', target: 90 }];

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'month',
		y: 'value',
		c: 'fruit',
		cRange: ['red', 'yellow'],
		width: 400,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Bars(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					Spline(node_2, {
						get data() {
							return targets;
						},
						y: 'target',
						stroke: 'black'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			Legend(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}