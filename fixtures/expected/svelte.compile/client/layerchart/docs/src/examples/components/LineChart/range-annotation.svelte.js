import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Range_annotation($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 30 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			annotations: [
				{
					type: 'range',
					x: [new Date('2010-01-01'), new Date('2010-12-31')],
					label: 'Range',
					labelPlacement: 'bottom',
					labelYOffset: 4,
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
				}
			],

			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}