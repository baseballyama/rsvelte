import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AnnotationRange, BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Bar_chart__value_($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 7);

	const dateSeriesData = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = {
		get data() {
			return data();
		},

		set data($$value) {
			data($$value);
		}
	};

	{
		const belowMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			AnnotationRange($$anchor, {
				y: [75, null],
				pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
			});
		};

		BarChart($$anchor, {
			get data() {
				return dateSeriesData;
			},
			x: 'date',
			y: 'value',
			height: 300,
			belowMarks,
			$$slots: { belowMarks: true }
		});
	}

	return $.pop($$exports);
}