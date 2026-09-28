import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Smart_labels_with_points($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 25, right: 10 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			xNice: true,
			get padding() {
				return $.get($0);
			},
			height: 300,
			points: true,
			labels: { placement: 'smart' }
		});
	}

	return $.pop($$exports);
}