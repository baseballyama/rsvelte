import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';

export default function BarsStackTestHarness($$anchor, $$props) {
	// `Bars` renders a `children` snippet in place of its bars when given one, so the shared
	// `TestHarness` (which always passes one) can't be used to exercise them
	let chartProps = $.prop($$props, 'chartProps', 19, () => ({})),
		barsProps = $.prop($$props, 'barsProps', 19, () => ({}));

	Chart($$anchor, $.spread_props(chartProps, {
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Bars($$anchor, $.spread_props(barsProps));
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	}));
}