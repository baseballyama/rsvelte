import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Labels, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Axis_labels_inside_bars_using_labels($$anchor, $$props) {
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
		const aboveMarks = ($$anchor) => {
			Labels($$anchor, {
				x: (d) => 0,
				value: 'date',
				class: 'text-sm fill-surface-300 stroke-none'
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 4, right: 10 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			y: 'date',
			labels: true,
			orientation: 'horizontal',
			axis: false,
			get padding() {
				return $.get($0);
			},
			height: 500,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}