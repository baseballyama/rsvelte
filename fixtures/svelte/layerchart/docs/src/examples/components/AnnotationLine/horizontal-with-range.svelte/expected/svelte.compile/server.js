import * as $ from 'svelte/internal/server';
import { AnnotationLine, AnnotationRange, LineChart } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Horizontal_with_range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function aboveMarks($$renderer, { context }) {
				AnnotationRange($$renderer, {
					y: [500, null],
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
				});

				$$renderer.push(`<!----> `);

				AnnotationLine($$renderer, {
					y: 500,
					label: 'Max',
					labelPlacement: 'bottom-right',
					labelYOffset: 2,
					props: { line: { dashArray: [2, 2] } }
				});

				$$renderer.push(`<!---->`);
			}

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 300,
				padding: { top: 10, bottom: 20, left: 25 },
				aboveMarks,
				$$slots: { aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}