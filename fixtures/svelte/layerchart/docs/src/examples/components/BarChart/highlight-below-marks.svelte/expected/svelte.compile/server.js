import * as $ from 'svelte/internal/server';
import { BarChart, Highlight } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Highlight_below_marks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function belowMarks($$renderer) {
				Highlight($$renderer, { area: { class: 'fill-surface-content/10' } });
			}

			BarChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				props: { highlight: { area: false } },
				height: 300,
				belowMarks,
				$$slots: { belowMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}