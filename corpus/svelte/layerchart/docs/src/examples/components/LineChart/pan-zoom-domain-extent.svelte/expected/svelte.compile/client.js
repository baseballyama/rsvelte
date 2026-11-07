import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Pan_zoom_domain_extent($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 365,
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
				scaleExtent: [1, 50],
				domainExtent: {
					x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
				}
			},

			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}