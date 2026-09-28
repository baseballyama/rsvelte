import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleThreshold } from 'd3-scale';

export default function Color_threshold($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 10, min: -20, max: 50, value: 'integer' });
	var $$exports = { data };

	{
		let $0 = $.derived(scaleThreshold);

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [0],
			cRange: ['var(--color-danger)', 'var(--color-success)'],
			height: 300
		});
	}

	return $.pop($$exports);
}