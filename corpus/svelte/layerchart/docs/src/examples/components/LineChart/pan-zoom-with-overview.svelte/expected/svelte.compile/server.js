import * as $ from 'svelte/internal/server';
import { LineChart, Chart, Area, Layer, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Pan_zoom_with_overview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mainContext = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				transform: {
					mode: 'domain',
					axis: 'x',
					scaleExtent: [1, 50],
					domainExtent: {
						x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
					}
				},
				clip: true,
				padding: defaultChartPadding({ left: 25, bottom: 24 }),
				height: 300,
				get context() {
					return mainContext;
				},

				set context($$value) {
					mainContext = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				padding: { left: 16 },
				brush: {
					x: mainContext?.xDomain,
					onChange: (e) => {
						if (mainContext && e.brush.active) {
							mainContext.zoomToBrush(e.brush, 'x');
						}
					},

					onBrushEnd: (e) => {
						if (mainContext && !e.brush.active) {
							mainContext.transform.reset();
						}
					}
				},
				height: 40,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Area($$renderer, {
								line: { class: 'stroke-2 stroke-primary' },
								class: 'fill-primary/20'
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
		$.bind_props($$props, { data });
	});
}