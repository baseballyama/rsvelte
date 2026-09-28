import * as $ from 'svelte/internal/server';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Hide_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function aboveMarks($$renderer, { context }) {
				AnnotationRange($$renderer, {
					x: [new Date('2010-01-01'), null],
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } },
					props: {
						rect: {
							onpointermove: (e) => {
								e.stopPropagation();
								context.tooltip.hide();
							}
						}
					}
				});
			}

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 300,
				padding: defaultChartPadding({ left: 25, bottom: 15 }),
				aboveMarks,
				$$slots: { aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}