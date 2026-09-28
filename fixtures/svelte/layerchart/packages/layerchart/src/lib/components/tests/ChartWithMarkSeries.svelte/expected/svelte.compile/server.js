import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';
import Spline from '../Spline/Spline.svelte';
import Legend from '../Legend.svelte';

export default function ChartWithMarkSeries($$renderer) {
	// Long rows coloured by `c`, plus a line with its own data — which registers as a series
	// named `target`, competing with the `c` categories for the legend
	const data = [
		{ month: 'Jan', fruit: 'apples', value: 30 },
		{ month: 'Jan', fruit: 'bananas', value: 20 },
		{ month: 'Feb', fruit: 'apples', value: 40 },
		{ month: 'Feb', fruit: 'bananas', value: 10 }
	];

	const targets = [{ month: 'Jan', target: 80 }, { month: 'Feb', target: 90 }];

	Chart($$renderer, {
		data,
		x: 'month',
		y: 'value',
		c: 'fruit',
		cRange: ['red', 'yellow'],
		width: 400,
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Bars($$renderer, {});
					$$renderer.push(`<!----> `);
					Spline($$renderer, { data: targets, y: 'target', stroke: 'black' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Legend($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}