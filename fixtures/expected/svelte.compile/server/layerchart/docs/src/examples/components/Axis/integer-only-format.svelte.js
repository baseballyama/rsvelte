import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';

export default function Integer_only_format($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 2],
		padding: 24,
		height: 48,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom', rule: true, format: 'integer' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}