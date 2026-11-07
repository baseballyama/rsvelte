import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScatterChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleThreshold } from 'd3-scale';

export default function Date_series_color_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 20, max: 100, value: 'integer' });
	var $$exports = { data };

	{
		let $0 = $.derived(scaleThreshold);

		ScatterChart($$anchor, {
			get data() {
				return data;
			},
			xNice: true,
			x: 'date',
			y: 'value',
			yBaseline: 0,
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [50],
			cRange: ['var(--color-danger)', 'var(--color-success)'],
			padding: 24,
			height: 400
		});
	}

	return $.pop($$exports);
}