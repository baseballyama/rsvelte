import * as $ from 'svelte/internal/server';
import { AnnotationLine, LineChart } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Vertical_with_rotation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function aboveMarks($$renderer, { context }) {
				AnnotationLine($$renderer, {
					x: new Date('2010-01-01'),
					label: 'Start',
					labelXOffset: 4,
					props: {
						line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
						label: {
							fill: 'var(--color-danger)',
							rotate: -90,
							textAnchor: 'end',
							verticalAnchor: 'end',
							dx: -2,
							dy: 0
						}
					}
				});

				$$renderer.push(`<!----> `);

				AnnotationLine($$renderer, {
					x: new Date('2010-12-31'),
					label: 'End',
					labelXOffset: 4,
					props: {
						line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
						label: {
							fill: 'var(--color-danger)',
							rotate: 90,
							verticalAnchor: 'end',
							dx: -4,
							dy: 0
						}
					}
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