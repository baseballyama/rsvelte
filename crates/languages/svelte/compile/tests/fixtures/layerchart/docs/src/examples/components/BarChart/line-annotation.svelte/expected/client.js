import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { mean } from 'd3-array';

export default function Line_annotation($$anchor, $$props) {
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
		let $0 = $.derived(() => [
			{
				type: 'line',
				y: mean(data, (d) => d.value),
				label: 'Avg',
				props: {
					line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
					label: { fill: 'var(--color-danger)' }
				}
			}
		]);

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get annotations() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}