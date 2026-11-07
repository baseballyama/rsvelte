import * as $ from 'svelte/internal/server';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
import AnnotationRangeControls from '$lib/components/controls/AnnotationRangePointLineControls.svelte';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Label_placement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const placementOptions = [
			'top-left',
			'top',
			'top-right',
			'left',
			'center',
			'right',
			'bottom-left',
			'bottom',
			'bottom-right'
		];

		let placement = 'center';
		let xOffset = 0;
		let yOffset = 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AnnotationRangeControls($$renderer, {
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
					AnnotationRange($$renderer, {
						x: [new Date('2010-01-01'), new Date('2010-12-31')],
						pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } },
						label: placement,
						labelPlacement: placement,
						labelXOffset: xOffset,
						labelYOffset: yOffset
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