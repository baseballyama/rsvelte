import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';

export default function Inject_ticks($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		padding: 24,
		height: 48,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, {
						placement: 'bottom',
						rule: true,
						ticks: (scale) => [45, ...scale.ticks?.() ?? []]
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}