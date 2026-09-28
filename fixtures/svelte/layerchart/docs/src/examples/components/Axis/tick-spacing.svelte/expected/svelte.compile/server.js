import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';

export default function Tick_spacing($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 2],
		padding: 24,
		height: 48,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom', rule: true, tickSpacing: 200 });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}