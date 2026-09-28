import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { chartDataArray } from '$lib/utils/common.js';

export default function ScatterChart_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Chart,
			Points,
			data = [],
			x: xProp,
			y: yProp,
			xDomain,
			yDomain,
			series: seriesProp,
			axis = true,
			brush = false,
			grid = { x: true, y: true },
			rule = { x: 0, y: 0 },
			highlight = { lines: true, points: true, axis: 'both' },
			legend = false,
			props = {},
			profile = false,
			tooltipContext = true,
			marks,
			tooltip: tooltipProp,
			context = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const series = $.derived(() => seriesProp === undefined
			? [{ key: 'default', data: chartDataArray(data) }]
			: seriesProp);

		if (profile) {
			console.time('ScatterChart render');

			onMount(() => {
				console.timeEnd('ScatterChart render');
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function marks($$renderer, { context }) {
					if (typeof marks === 'function') {
						$$renderer.push('<!--[0-->');
						marks($$renderer, { context });
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array = $.ensure_array_like(context.series.visibleSeries);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let s = each_array[i];

							if (Points) {
								$$renderer.push('<!--[-->');
								Points($$renderer, $.spread_props([{ seriesKey: s.key }, props.points]));
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				}

				if (Chart) {
					$$renderer.push('<!--[-->');

					Chart($$renderer, $.spread_props([
						{
							data,
							x: xProp,
							xDomain,
							y: yProp,
							yDomain,
							c: yProp,
							cRange: ['var(--color-primary, currentColor)']
						},
						restProps,
						{
							tooltipContext: tooltipContext === false
								? false
								: {
									mode: 'quadtree',
									...props.tooltip?.context,
									...typeof tooltipContext === 'object' ? tooltipContext : null
								},

							brush: brush
								? {
									axis: 'both',
									zoomOnBrush: true,
									...typeof brush === 'object' ? brush : null,
									...props.brush
								}
								: false,
							series: series(),
							axis,
							grid,
							rule,
							highlight,
							legend,
							tooltip: tooltipProp,
							props,
							get context() {
								return context;
							},

							set context($$value) {
								context = $$value;
								$$settled = false;
							},
							marks,
							$$slots: { marks: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { context });
	});
}