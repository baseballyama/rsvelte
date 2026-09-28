import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Line_annotation($$anchor, $$props) {
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
			annotations: [
				{
					type: 'line',
					y: 500,
					label: 'Max',
					labelXOffset: 4,
					labelYOffset: 2,
					props: {
						label: { fill: 'var(--color-danger)' },
						line: { dashArray: [2, 2], stroke: 'var(--color-danger)' }
					}
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