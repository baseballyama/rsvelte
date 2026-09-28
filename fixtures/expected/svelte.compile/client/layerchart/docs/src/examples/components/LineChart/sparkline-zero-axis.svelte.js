import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkline_zero_axis($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 50, min: 50, max: 100 });
	var $$exports = { data };

	LineChart($$anchor, {
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
		height: 20
	});

	return $.pop($$exports);
}