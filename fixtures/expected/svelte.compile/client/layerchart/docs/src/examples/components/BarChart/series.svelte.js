import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	BarChart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		series: [
			{
				key: 'baseline',
				color: 'var(--color-surface-content)',
				props: { fillOpacity: 0.2 }
			},

			{
				key: 'value',
				color: 'var(--color-primary)',
				props: { insets: { x: 8 } }
			}
		],
		seriesLayout: 'overlap',
		height: 300
	});

	return $.pop($$exports);
}