import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pie } from 'layerchart';

export default function Basic($$renderer, $$props) {
	// fixed data (same as disable-sorting example to call attention to what sorting does)
	const data = [
		{ date: '2025-11-04T05:00:00.000Z', value: 99 },
		{ date: '2025-11-06T05:00:00.000Z', value: 30 },
		{ date: '2025-11-05T05:00:00.000Z', value: 14 },
		{ date: '2025-11-07T05:00:00.000Z', value: 67 }
	];

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	Chart($$renderer, {
		data,
		x: 'value',
		c: 'date',
		cRange: keyColors,
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				center: true,
				children: ($$renderer) => {
					Pie($$renderer, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.bind_props($$props, { data });
}