import * as $ from 'svelte/internal/server';
import { Chart, ChartClipPath, Circle, Layer, Points, Voronoi } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';
import VoronoiControls from '$lib/components/controls/VoronoiControls.svelte';

export default function Radius($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = getSpiral({
			angle: 137.5,
			radius: 10,
			count: 100,
			width: 500,
			height: 500
		});

		let point = { x: 0, y: 0 };

		function onPointerMove(e) {
			point = { x: e.offsetX, y: e.offsetY };
		}

		let radius = 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			VoronoiControls($$renderer, {
				get radius() {
					return radius;
				},

				set radius($$value) {
					radius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						onpointermove: onPointerMove,
						children: ($$renderer) => {
							ChartClipPath($$renderer, {
								children: ($$renderer) => {
									Points($$renderer, { r: 2, class: 'fill-primary stroke-primary' });
									$$renderer.push(`<!----> `);

									Voronoi($$renderer, {
										data: [
											{
												x: context.xScale?.invert?.(point.x),
												y: context.yScale?.invert?.(point.y)
											},
											...data
										],
										r: radius,
										classes: {
											path: 'pointer-events-none stroke-primary fill-primary/10 first:fill-primary/50'
										}
									});

									$$renderer.push(`<!----> `);
									Circle($$renderer, { cx: point.x, cy: point.y, r: 4, class: 'fill-primary' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				}

				Chart($$renderer, {
					data,
					x: 'x',
					y: 'y',
					height: 400,
					children,
					$$slots: { default: true }
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