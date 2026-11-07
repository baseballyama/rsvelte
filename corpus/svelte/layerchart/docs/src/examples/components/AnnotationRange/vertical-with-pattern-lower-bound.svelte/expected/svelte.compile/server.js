import * as $ from 'svelte/internal/server';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Vertical_with_pattern_lower_bound($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function belowMarks($$renderer, { context }) {
				AnnotationRange($$renderer, {
					x: [new Date('2010-01-01'), null],
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
				});
			}

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 300,
				padding: defaultChartPadding({ left: 25, bottom: 15 }),
				belowMarks,
				$$slots: { belowMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}