import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';

export default function Integer_only_filter($$anchor, $$props) {
	$.push($$props, true);

	Chart($$anchor, {
		xDomain: [0, 2],
		padding: 24,
		height: 48,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Axis($$anchor, {
						placement: 'bottom',
						rule: true,
						ticks: (scale) => scale.ticks?.().filter(Number.isInteger)
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}