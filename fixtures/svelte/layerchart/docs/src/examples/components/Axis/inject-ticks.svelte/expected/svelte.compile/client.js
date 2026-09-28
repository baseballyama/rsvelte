import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';

export default function Inject_ticks($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		padding: 24,
		height: 48,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Axis($$anchor, {
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