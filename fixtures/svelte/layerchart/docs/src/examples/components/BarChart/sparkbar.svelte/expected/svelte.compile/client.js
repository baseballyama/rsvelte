import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkbar($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 20, max: 100 });
	var $$exports = { data };

	BarChart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		axis: false,
		grid: false,
		bandPadding: 0.1,
		props: { bars: { radius: 1, strokeWidth: 0 } },
		height: 18,
		width: 124
	});

	return $.pop($$exports);
}