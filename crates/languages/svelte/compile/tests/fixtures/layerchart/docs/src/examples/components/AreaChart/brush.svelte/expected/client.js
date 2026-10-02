import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Brush($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			brush: true,
			motion: { type: 'spring' },
			props: {
				xAxis: { tickMultiline: true },
				canvas: { class: 'cursor-crosshair' },
				svg: { class: 'cursor-crosshair' }
			},

			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}