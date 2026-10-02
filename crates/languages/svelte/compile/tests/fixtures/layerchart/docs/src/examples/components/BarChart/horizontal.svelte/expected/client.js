import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	}).slice(0, 10);

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 30 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			y: 'date',
			orientation: 'horizontal',
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}