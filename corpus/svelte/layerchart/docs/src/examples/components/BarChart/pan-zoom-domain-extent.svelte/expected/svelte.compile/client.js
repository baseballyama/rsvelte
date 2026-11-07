import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { timeDay } from 'd3-time';

export default function Pan_zoom_domain_extent($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 100,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	BarChart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		get xInterval() {
			return timeDay;
		},

		transform: {
			mode: 'domain',
			axis: 'x',
			scaleExtent: [1, 50],
			domainExtent: { x: { min: 'data', max: 'data' } }
		},
		height: 300
	});

	return $.pop($$exports);
}