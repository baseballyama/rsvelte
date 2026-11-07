import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { timeYear } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';
import AxisControls from '$lib/components/controls/AxisControls.svelte';

export default function Time_scale_brush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());
		let initialXDomain = [timeYear.offset(today, -4), today];
		let xDomain = initialXDomain;
		let tickSpacing = 80; // x-axis default
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AxisControls($$renderer, {
				get value() {
					return tickSpacing;
				},

				set value($$value) {
					tickSpacing = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				xDomain,
				yDomain: [0, 100],
				padding: { top: 20, bottom: 20, left: 20, right: 20 },
				brush: {
					onBrushEnd: (e) => {
						xDomain = e.brush.x;
						e.brush.reset();
					}
				},
				height: 200,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'bottom', rule: true, grid: true, tickSpacing });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'left' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				xDomain: initialXDomain,
				padding: { top: 20, bottom: 20, left: 20, right: 20 },
				brush: {
					x: xDomain,
					onChange: (e) => {
						xDomain = e.brush.x;
					}
				},
				height: 80,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, {
								placement: 'bottom',
								rule: true,
								grid: true,
								ticks: { interval: timeYear.every(1) }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}