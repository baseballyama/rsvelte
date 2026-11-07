import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Single_axis_y($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 10, bottom: 10 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			axis: 'y',
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}