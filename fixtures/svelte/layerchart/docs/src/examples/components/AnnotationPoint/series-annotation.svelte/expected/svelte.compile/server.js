import * as $ from 'svelte/internal/server';
import { AnnotationPoint, LineChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Series_annotation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function aboveMarks($$renderer, { context }) {
				const lastPoint = data[data.length - 1];

				AnnotationPoint($$renderer, {
					x: lastPoint.date,
					y: lastPoint.value,
					label: 'Apple',
					labelPlacement: 'right',
					labelXOffset: 4,
					props: {
						circle: { class: 'fill-secondary' },
						label: { class: 'fill-secondary font-bold' }
					}
				});
			}

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				padding: defaultChartPadding({ right: 45, bottom: 15, left: 25 }),
				height: 300,
				aboveMarks,
				$$slots: { aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}