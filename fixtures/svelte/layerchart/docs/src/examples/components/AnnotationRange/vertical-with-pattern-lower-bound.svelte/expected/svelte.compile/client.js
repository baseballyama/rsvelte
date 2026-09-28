import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Vertical_with_pattern_lower_bound($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const belowMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			AnnotationRange($$anchor, {
				x: [new Date('2010-01-01'), null],
				pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 15 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			get padding() {
				return $.get($0);
			},
			belowMarks,
			$$slots: { belowMarks: true }
		});
	}

	return $.pop($$exports);
}