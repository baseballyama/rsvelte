import * as $ from 'svelte/internal/server';
import { Chart, CircleLegend } from 'layerchart';
import { scaleSqrt } from 'd3-scale';

export default function Basic($$renderer) {
	Chart($$renderer, {
		data: [{ value: 1 }, { value: 100 }],
		r: 'value',
		rRange: [2, 40],
		height: 120,
		children: ($$renderer) => {
			CircleLegend($$renderer, { title: 'Population' });
		},
		$$slots: { default: true }
	});
}