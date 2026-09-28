import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Range_annotation($$anchor, $$props) {
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
			height: 300,
			get padding() {
				return $.get($0);
			},

			annotations: [
				{
					type: 'range',
					x: [new Date('2010-01-01'), new Date('2010-12-31')],
					label: 'Range',
					labelPlacement: 'bottom',
					labelYOffset: 4,
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
				}
			]
		});
	}

	return $.pop($$exports);
}