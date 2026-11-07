import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkline($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };

	AreaChart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		axis: false,
		grid: false,
		props: {
			highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
		},
		width: 124,
		height: 24
	});

	return $.pop($$exports);
}