import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';

export default function BarsStackTestHarness($$renderer, $$props) {
	// `Bars` renders a `children` snippet in place of its bars when given one, so the shared
	// `TestHarness` (which always passes one) can't be used to exercise them
	let { chartProps = {}, barsProps = {} } = $$props;

	Chart($$renderer, $.spread_props([
		chartProps,
		{
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Bars($$renderer, $.spread_props([barsProps]));
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}
	]));
}