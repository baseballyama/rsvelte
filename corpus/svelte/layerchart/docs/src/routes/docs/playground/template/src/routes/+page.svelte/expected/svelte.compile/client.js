import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	LineChart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		height: 300
	});

	$.pop();
}