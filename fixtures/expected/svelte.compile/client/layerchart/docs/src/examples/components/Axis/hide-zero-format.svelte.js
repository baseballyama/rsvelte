import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';

export default function Hide_zero_format($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 2],
		padding: 24,
		height: 48,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Axis($$anchor, { placement: 'bottom', rule: true, format: (v) => v || '' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}