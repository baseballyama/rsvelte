import * as $ from 'svelte/internal/server';
import { LayerCake, ScaledSvg, Html } from 'layercake';
import Line from './Line.svelte';
import Area from './Area.svelte';
import AxisX from './AxisX.percent-range.html.svelte';
import AxisY from './AxisY.percent-range.html.svelte';
import Brush from './Brush.html.svelte';

export default function SyncedBrushWrapper_percent_range($$renderer, $$props) {
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
			$$renderer.push(`<div class="chart-wrapper svelte-1xih10n"><div class="chart-container svelte-1xih10n">`);

			LayerCake($$renderer, {
				ssr: true,
				percentRange: true,
				padding: { bottom: 20, left: 25 },
				x: xKey,
				y: yKey,
				yDomain: [0, null],
				data: brushedData(),
				children: ($$renderer) => {
					Html($$renderer, {
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
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ScaledSvg($$renderer, {
						children: ($$renderer) => {
							Line($$renderer, { stroke });
							$$renderer.push(`<!----> `);
							Area($$renderer, { fill: `${stroke}10` });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="brush-container svelte-1xih10n">`);

			LayerCake($$renderer, {
				ssr: true,
				percentRange: true,
				padding: { top: 5 },
				x: xKey,
				y: yKey,
				yDomain: [0, null],
				data,
				children: ($$renderer) => {
					ScaledSvg($$renderer, {
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