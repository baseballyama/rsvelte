import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Highlight } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Highlight_below_marks($$anchor, $$props) {
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
		const belowMarks = ($$anchor) => {
			Highlight($$anchor, { area: { class: 'fill-surface-content/10' } });
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			props: { highlight: { area: false } },
			height: 300,
			belowMarks,
			$$slots: { belowMarks: true }
		});
	}

	return $.pop($$exports);
}