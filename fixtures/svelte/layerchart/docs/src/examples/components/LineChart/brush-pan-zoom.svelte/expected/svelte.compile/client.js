import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { LineChart, ChartClipPath, Spline, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Brush_pan_zoom($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			brush: true,
			transform: { mode: 'domain', axis: 'x' },
			motion: { type: 'spring' },
			clip: true,
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}