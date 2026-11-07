import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, CircleLegend } from 'layerchart';
import { scaleSqrt } from 'd3-scale';

export default function Basic($$anchor) {
	Chart($$anchor, {
		data: [{ value: 1 }, { value: 100 }],
		r: 'value',
		rRange: [2, 40],
		height: 120,
		children: ($$anchor, $$slotProps) => {
			CircleLegend($$anchor, { title: 'Population' });
		},
		$$slots: { default: true }
	});
}