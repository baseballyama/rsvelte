import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import Line from './Line.svelte';
import Area from './Area.svelte';
import AxisX from './AxisX.svelte';
import AxisY from './AxisY.svelte';
import Brush from './Brush.html.svelte';

export default function SyncedBrushWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {any} [min]
		 * @property {any} [max]
		 * @property {string} [xKey]
		 * @property {string} [yKey]
		 * @property {any} [data]
		 * @property {string} [stroke]
		 */
		/** @type {Props} */
		let {
			min = null,
			max = null,
			xKey = 'x',
			yKey = 'y',
			data = [],
			stroke = '#00e047'
		} = $$props;

		let brushedData = $.derived(() => {
			const start = Math.max(0, Math.floor((min ?? 0) * data.length));
			const end = Math.min(data.length, Math.ceil((max ?? 1) * data.length));
			let brushed = data.slice(start, end);

			if (brushed.length < 2 && data.length >= 2) {
				return data.slice(start, start + 2);
			}

			return brushed;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="chart-wrapper svelte-13ntwi4"><div class="chart-container svelte-13ntwi4">`);

			LayerCake($$renderer, {
				padding: { bottom: 20, left: 25 },
				x: xKey,
				y: yKey,
				yDomain: [0, null],
				data: brushedData(),
				children: ($$renderer) => {
					Svg($$renderer, {
						children: ($$renderer) => {
							AxisX($$renderer, {
								ticks: (ticks) => {
									const filtered = ticks.filter((t) => t % 1 === 0);

									if (filtered.length > 7) {
										return filtered.filter((t, i) => i % 2 === 0);
									}

									return filtered;
								}
							});

							$$renderer.push(`<!----> `);
							AxisY($$renderer, { ticks: 2 });
							$$renderer.push(`<!----> `);
							Line($$renderer, { stroke });
							$$renderer.push(`<!----> `);
							Area($$renderer, { fill: `${stroke}10` });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="brush-container svelte-13ntwi4">`);

			LayerCake($$renderer, {
				padding: { top: 5 },
				x: xKey,
				y: yKey,
				yDomain: [0, null],
				data,
				children: ($$renderer) => {
					Svg($$renderer, {
						children: ($$renderer) => {
							Line($$renderer, { stroke });
							$$renderer.push(`<!----> `);
							Area($$renderer, { fill: `${stroke}10` });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Html($$renderer, {
						children: ($$renderer) => {
							Brush($$renderer, {
								get min() {
									return min;
								},

								set min($$value) {
									min = $$value;
									$$settled = false;
								},

								get max() {
									return max;
								},

								set max($$value) {
									max = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { min, max });
	});
}