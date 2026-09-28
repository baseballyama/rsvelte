import * as $ from 'svelte/internal/server';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Horizontal_with_fill_multiple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function belowMarks($$renderer, { context }) {
				AnnotationRange($$renderer, { y: [0, 400], class: 'fill-success/10' });
				$$renderer.push(`<!----> `);
				AnnotationRange($$renderer, { y: [400, 600], class: 'fill-warning/10' });
				$$renderer.push(`<!----> `);
				AnnotationRange($$renderer, { y: [600, null], class: 'fill-danger/10' });
				$$renderer.push(`<!---->`);
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