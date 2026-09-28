import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Pie } from 'layerchart';

export default function Disable_sorting($$anchor, $$props) {
	$.push($$props, true);

	// fixed data (same as basic example to call attention to what sorting does)
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

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'value',
		c: 'date',
		get cRange() {
			return keyColors;
		},
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					Pie($$anchor, { sort: null });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}