import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { scalePoint } from 'd3-scale';
import { longData } from '$lib/utils/data.js';

export default function Point_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	{
		let $0 = $.derived(scalePoint);
		let $1 = $.derived(() => defaultChartPadding({ left: 30, right: 15 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},

			get xScale() {
				return $.get($0);
			},
			x: 'fruit',
			y: 'value',
			get padding() {
				return $.get($1);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}