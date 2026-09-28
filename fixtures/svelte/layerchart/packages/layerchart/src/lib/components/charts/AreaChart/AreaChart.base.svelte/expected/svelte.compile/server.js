import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getObjectOrNull } from '$lib/utils/common.js';

export default function AreaChart_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Chart,
			Area,
			data = [],
			y,
			xDomain,
			radial = false,
			series: seriesProp,
			seriesLayout = 'auto',
			axis = true,
			brush = false,
			grid = true,
			legend = false,
			tooltipContext = true,
			highlight = { lines: true, points: true },
			rule = true,
			onPointClick,
			props = {},
			profile = false,
			marks,
			tooltip: tooltipProp,
			context = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const series = $.derived(() => seriesProp === undefined
			? [
				{
					key: 'default',
					label: typeof y === 'string' ? y : 'value',
					value: y,
					color: 'var(--color-primary, currentColor)'
				}
			]
			: seriesProp);

		if (profile) {
			console.time('AreaChart render');

			onMount(() => {
				console.timeEnd('AreaChart render');
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

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let s = each_array[$$index];

							if (Area) {
								$$renderer.push('<!--[-->');

								Area($$renderer, $.spread_props([
									{
										seriesKey: s.key,
										fillOpacity: 0.3,
										line: {
											...props.line,
											...getObjectOrNull(props.area?.line),
											...getObjectOrNull(s.props?.line)
										}
									},
									props.area,
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
						{ data, xDomain, y, yBaseline: 0, yNice: true, radial },
						restProps,
						{
							tooltipContext: tooltipContext === false
								? false
								: {
									mode: 'quadtree-x',
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
							tooltip: tooltipProp,
							props: { ...props, highlight: { ...props.highlight, onPointClick } },
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