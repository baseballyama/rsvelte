import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getObjectOrNull } from '$lib/utils/common.js';
import { isScaleTime } from '$lib/utils/scales.svelte.js';

export default function LineChart_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Chart,
			Spline,
			data = [],
			x: xProp,
			xScale,
			xDomain,
			y: yProp,
			yScale,
			radial = false,
			orientation = 'horizontal',
			valueAxis: valueAxisProp,
			series: seriesProp,
			axis = true,
			brush = false,
			highlight = { lines: true, points: true },
			legend = false,
			onPointClick,
			props = {},
			profile = false,
			tooltipContext = true,
			marks,
			context = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const valueAxis = $.derived(() => valueAxisProp ?? (orientation === 'horizontal' ? 'y' : 'x'));

		const series = $.derived(() => seriesProp === undefined
			? [
				{
					key: 'default',
					label: valueAxis() == 'x'
						? typeof xProp === 'string' ? xProp : 'value'
						: typeof yProp === 'string' ? yProp : 'value',
					value: valueAxis() == 'x' ? xProp : yProp,
					color: 'var(--color-primary, currentColor)'
				}
			]
			: seriesProp);

		const highlightWithPointClick = $.derived(() => typeof highlight === 'function'
			? highlight
			: onPointClick
				? {
					...getObjectOrNull(highlight),
					...props.highlight,
					onPointClick
				}
				: highlight);

		if (profile) {
			console.time('LineChart render');

			onMount(() => {
				console.timeEnd('LineChart render');
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

							if (Spline) {
								$$renderer.push('<!--[-->');
								Spline($$renderer, $.spread_props([{ seriesKey: s.key }, props.spline]));
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
							xScale,
							x: xProp ?? (valueAxis() === 'x' ? series().map((s) => s.value ?? s.key) : undefined),
							xDomain,
							xBaseline: valueAxis() === 'y' || xScale && isScaleTime(xScale) ? undefined : 0,
							yScale,
							y: yProp ?? (valueAxis() === 'y' ? series().map((s) => s.value ?? s.key) : undefined),
							yBaseline: valueAxis() === 'x' || yScale && isScaleTime(yScale) ? undefined : 0,
							radial,
							valueAxis: valueAxis(),
							axis
						},
						restProps,
						{
							tooltipContext: tooltipContext === false
								? false
								: {
									mode: valueAxis() === 'x' ? 'quadtree-y' : 'quadtree-x',
									...props.tooltip?.context,
									...typeof tooltipContext === 'object' ? tooltipContext : null
								},

							brush: brush
								? {
									axis: 'x',
									zoomOnBrush: true,
									...typeof brush === 'object' ? brush : null,
									...props.brush
								}
								: false,
							series: series(),
							highlight: highlightWithPointClick(),
							legend,
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