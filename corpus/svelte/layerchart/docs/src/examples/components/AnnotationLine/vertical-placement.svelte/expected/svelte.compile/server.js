import * as $ from 'svelte/internal/server';
import { AnnotationLine, LineChart } from 'layerchart';
import AnnotationLineControls from '$lib/components/controls/AnnotationRangePointLineControls.svelte';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Vertical_placement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let placement = 'top-right';
		let xOffset = 5;
		let yOffset = 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AnnotationLineControls($$renderer, {
				get placement() {
					return placement;
				},

				set placement($$value) {
					placement = $$value;
					$$settled = false;
				},

				get xOffset() {
					return xOffset;
				},

				set xOffset($$value) {
					xOffset = $$value;
					$$settled = false;
				},

				get yOffset() {
					return yOffset;
				},

				set yOffset($$value) {
					yOffset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function aboveMarks($$renderer, { context }) {
					AnnotationLine($$renderer, {
						x: new Date('2010-03-30'),
						label: placement,
						labelPlacement: placement,
						labelXOffset: xOffset,
						labelYOffset: yOffset,
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

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}