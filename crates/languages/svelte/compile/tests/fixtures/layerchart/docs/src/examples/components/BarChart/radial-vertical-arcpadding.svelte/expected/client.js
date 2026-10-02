import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Radial_vertical_arcpadding($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 15, bottom: 15 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yRange: ({ height }) => [height / 5, height / 2],
			radial: true,
			props: { bars: { padAngle: 0.1 } },
			get padding() {
				return $.get($0);
			},
			height: 400
		});
	}

	return $.pop($$exports);
}