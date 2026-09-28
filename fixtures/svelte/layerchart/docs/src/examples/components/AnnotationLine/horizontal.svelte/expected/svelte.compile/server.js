import * as $ from 'svelte/internal/server';
import { AnnotationLine, LineChart } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function aboveMarks($$renderer, { context }) {
				AnnotationLine($$renderer, {
					y: 500,
					label: 'Max',
					props: {
						line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
						label: { fill: 'var(--color-danger)' }
					}
				});
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