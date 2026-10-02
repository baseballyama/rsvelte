import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Vertical_with_gradient_range($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const belowMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			AnnotationRange($$anchor, {
				x: [new Date('2011-01-01'), new Date('2011-06-30')],
				gradient: { class: 'from-danger/30 to-danger/1', vertical: true }
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