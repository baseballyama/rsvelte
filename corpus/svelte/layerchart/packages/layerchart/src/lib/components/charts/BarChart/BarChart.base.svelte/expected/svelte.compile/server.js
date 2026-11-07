import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function BarChart_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Chart,
			Bars,
			data = [],
			x: xProp,
			y: yProp,
			xDomain,
			radial = false,
			orientation = 'vertical',
			series: seriesProp,
			seriesLayout = 'auto',
			axis = true,
			brush = false,
			grid = true,
			highlight = { area: true },
			legend = false,
			rule = true,
			onBarClick = () => {},
			props = {},
			profile = false,
			bandPadding = radial ? 0 : 0.4,
			groupPadding = 0,
			stackPadding = 0,
			xInterval,
			yInterval,
			tooltipContext = true,
			marks,
			context = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const valueAxis = $.derived(() => orientation === 'horizontal' ? 'x' : 'y');

		const series = $.derived(() => seriesProp === undefined
			? [
				{
					key: 'default',
					label: valueAxis() === 'y'
						? typeof yProp === 'string' ? yProp : 'value'
						: typeof xProp === 'string' ? xProp : 'value',
					value: valueAxis() === 'y' ? yProp : xProp
				}
			]
			: seriesProp);

		const isGroupSeries = $.derived(() => seriesLayout === 'group');

		if (profile) {
			console.time('BarChart render');

			onMount(() => {
				console.timeEnd('BarChart render');
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

							if (Bars) {
								$$renderer.push('<!--[-->');

								Bars($$renderer, $.spread_props([
									{
										seriesKey: s.key,
										x1: valueAxis() === 'y' && isGroupSeries() && restProps.x1 == null ? (d) => s.value ?? s.key : undefined,
										y1: valueAxis() === 'x' && isGroupSeries() && restProps.y1 == null ? (d) => s.value ?? s.key : undefined,
										rounded: context.series.stackLayout != null
											? (d) => context.series.isStackTop(s.key, d) ? 'edge' : 'none'
											: Array.isArray(xProp) || Array.isArray(yProp) ? 'all' : 'edge',
										radius: 4,
										strokeWidth: 1,
										stackPadding,
										opacity: (d) => context.series.isHighlighted(context.cKey(d) ?? s.key, true) ? 1 : 0.1,
										onBarClick: (e, detail) => onBarClick(e, { ...detail, series: s })
									},
									props.bars,
									s.props
								]));

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
							xInterval,
							y: yProp,
							yInterval,
							c: valueAxis() === 'y' ? yProp : xProp,
							cRange: ['var(--color-primary, currentColor)'],
							radial,
							valueAxis: valueAxis(),
							bandPadding,
							groupPadding
						},
						restProps,
						{
							tooltipContext: tooltipContext === false
								? false
								: {
									mode: 'band',
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
							seriesLayout,
							axis,
							grid,
							rule,
							legend,
							highlight,
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