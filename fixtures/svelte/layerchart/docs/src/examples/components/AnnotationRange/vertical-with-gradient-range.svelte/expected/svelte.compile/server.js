import * as $ from 'svelte/internal/server';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Vertical_with_gradient_range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function belowMarks($$renderer, { context }) {
				AnnotationRange($$renderer, {
					x: [new Date('2011-01-01'), new Date('2011-06-30')],
					gradient: { class: 'from-danger/30 to-danger/1', vertical: true }
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