import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';

export default function Hide_zero_filter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			xDomain: [0, 2],
			padding: 24,
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							rule: true,
							ticks: (scale) => scale.ticks?.().filter((d) => d !== 0)
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}