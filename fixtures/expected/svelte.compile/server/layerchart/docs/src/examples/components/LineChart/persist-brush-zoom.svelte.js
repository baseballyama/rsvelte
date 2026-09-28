import * as $ from 'svelte/internal/server';
import { LineChart, Chart, Area, Layer, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Persist_brush_zoom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const STORAGE_KEY = 'layerchart:persist-brush-zoom:range';
		let context = void 0;

		// Read before the first render, so the chart opens at the saved range rather than zooming to it
		// afterwards — `transform.initialDomain` is applied from the first frame.
		function loadRange() {
			const saved = localStorage.getItem(STORAGE_KEY);

			if (!saved) return undefined;

			const parsed = JSON.parse(saved);

			if (!Array.isArray(parsed) || parsed.length !== 2) return undefined;

			return [new Date(parsed[0]), new Date(parsed[1])];
		}

		const initialDomain = loadRange();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-center pb-4 text-sm">Select desired brush range, reload the page, and it will persist.</div> `);

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				transform: {
					mode: 'domain',
					axis: 'x',
					scaleExtent: [1, 50],
					initialDomain: initialDomain ? { x: initialDomain } : undefined,
					domainExtent: {
						x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
					}
				},
				clip: true,
				padding: defaultChartPadding({ left: 25, bottom: 24 }),
				height: 300,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
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
					x: context?.xDomain,
					onChange: (e) => {
						if (context && e.brush.active) {
							context.zoomToBrush(e.brush, 'x');
						}
					},

					onBrushEnd: (e) => {
						if (context && !e.brush.active) {
							context.transform.reset();
							localStorage.removeItem(STORAGE_KEY);
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
	});
}