import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Pan_zoom_custom_constrain($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 100,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			transform: {
				mode: 'domain',
				axis: 'x',
				constrain: ({ scale, translate }) => ({
					scale: Math.max(1, Math.min(20, scale)),
					translate: { x: Math.min(0, translate.x), y: 0 }
				})
			},

			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}