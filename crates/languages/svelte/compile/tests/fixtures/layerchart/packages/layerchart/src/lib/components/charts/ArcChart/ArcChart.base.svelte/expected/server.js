import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { sum } from 'd3-array';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import * as Tooltip from '../../tooltip/index.js';
import { accessor, chartDataArray, getObjectOrNull } from '$lib/utils/common.js';
import { getColorIfDefined } from '$lib/utils/color.js';

export default function ArcChart_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Chart,
			Arc,
			ArcLabel,
			Group,
			data = [],
			key = 'key',
			label = 'label',
			value = 'value',
			range = [0, 360],
			c: cProp,
			innerRadius = 0,
			outerRadius = 0,
			cornerRadius = 0,
			padAngle = 0,
			placement = 'center',
			maxValue,
			center: centerProp,
			series: seriesProp,
			legend = false,
			onArcClick = () => {},
			// TODO: Not usable with manual tooltip / arc path.  Use `onArcClick`?
			/** Event dispatched with current tooltip data */
			onTooltipClick = () => {},
			props = {},
			profile = false,
			tooltipContext = true,
			marks,
			tooltip: tooltipProp,
			arc,
			labels = false,
			context = void 0,
			trackCornerRadius,
			trackPadAngle,
			trackStartAngle,
			trackEndAngle,
			trackInnerRadius,
			trackOuterRadius,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const center = $.derived(() => centerProp ?? placement === 'center');
		const labelsConfig = $.derived(() => labels === true ? {} : labels || null);
		const c = $.derived(() => cProp ?? key);
		const keyAccessor = $.derived(() => accessor(key));
		const labelAccessor = $.derived(() => accessor(label));
		const valueAccessor = $.derived(() => accessor(value));
		const cAccessor = $.derived(() => accessor(c()));
		const _series = $.derived(() => seriesProp === undefined ? [{ key: 'default', value }] : seriesProp);
		const isDefaultSeries = $.derived(() => _series().length === 1 && _series()[0].key === 'default');

		const series = $.derived(() => {
			if (!isDefaultSeries()) return _series();

			// build series from data
			return chartDataArray(data).map((d) => {
				return {
					key: keyAccessor()(d),
					value: valueAccessor()(d),
					label: labelAccessor()(d),
					color: getColorIfDefined(d),
					maxValue,
					data: [d]
				};
			});
		});

		// ArcChart needs local chartData for visibleData filtering and cDomain calculation.
		// IMPORTANT: Compute locally from `series` and `data` — NOT from `context.series.allSeriesData`.
		// Reading context.series.allSeriesData here would create a derived_references_self cycle:
		//   SeriesState.#series → ChartState.props → data={visibleData} → chartData → context.series.allSeriesData → #series
		const chartData = $.derived(() => {
			const seriesData = series().flatMap((s) => s.data ?? []);

			return seriesData.length > 0 ? seriesData : chartDataArray(data);
		});

		const visibleData = $.derived(() => chartData().filter((d) => {
			const dataKey = keyAccessor()(d);
			const selectedKeys = context?.series.selectedKeys;

			return !selectedKeys || selectedKeys.isEmpty() || selectedKeys.isSelected(dataKey);
		}));

		// Compute series colors locally to avoid derived_references_self cycle through context.series.allSeriesColors
		const allSeriesColors = $.derived(() => series().map((s) => s.color).filter((c) => c != null));

		// Custom tickFormat for ArcChart legends - uses data labels instead of series labels
		const legendTickFormat = (tick) => {
			const item = chartData().find((d) => keyAccessor()(d) === tick);

			return item ? labelAccessor()(item) ?? tick : tick;
		};

		function getGroupProps() {
			if (!context) return {};

			return {
				x: placement === 'left'
					? context.height / 2
					: placement === 'right' ? context.width - context.height / 2 : undefined,
				center: ['left', 'right'].includes(placement) ? 'y' : undefined,
				...props.group
			};
		}

		function getArcProps(s, i) {
			if (!context) return {};

			const d = s.data?.[0] || chartData()[0];
			const multiSeries = chartDataArray(data).length > 1 || series().length > 1;

			return {
				value: valueAccessor()(d),
				domain: [
					0,
					s.maxValue ?? maxValue ?? sum(chartData(), valueAccessor())
				],
				range,
				innerRadius,
				outerRadius: multiSeries && (outerRadius ?? 0) < 0 ? i * (outerRadius ?? 0) : outerRadius,
				cornerRadius,
				padAngle,
				trackCornerRadius,
				trackPadAngle,
				trackStartAngle,
				trackEndAngle,
				trackInnerRadius,
				trackOuterRadius: multiSeries && (trackOuterRadius ?? 0) < 0 ? i * (trackOuterRadius ?? 0) : trackOuterRadius,
				fill: s.color ?? context.cScale?.(context.c(d)),
				track: {
					fill: s.color ?? context.cScale?.(context.c(d)),
					fillOpacity: 0.1
				},
				opacity: context?.series.isHighlighted(keyAccessor()(d), true) ?? true ? 1 : 0.1,
				tooltip: true,
				data: d,
				onclick: (e) => {
					onArcClick(e, { data: d, series: s });

					// Workaround for `tooltip={{ mode: 'manual' }}
					onTooltipClick(e, { data: d });
				},
				...props.arc,
				...s.props,
				class: cls(props.arc?.class, s.props?.class)
			};
		}

		if (profile) {
			console.time('ArcChart render');

			onMount(() => {
				console.timeEnd('ArcChart render');
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function marks($$renderer, snippetProps) {
					if (typeof marks === 'function') {
						$$renderer.push('<!--[0-->');
						marks($$renderer, snippetProps);
					} else {
						$$renderer.push('<!--[-1-->');

						if (Group) {
							$$renderer.push('<!--[-->');

							Group($$renderer, $.spread_props([
								getGroupProps(),
								{
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(series());

										for (let i = 0, $$length = each_array.length; i < $$length; i++) {
											let s = each_array[i];

											if (typeof arc === 'function') {
												$$renderer.push('<!--[0-->');

												arc($$renderer, {
													...snippetProps,
													label: labelAccessor(),
													key: keyAccessor(),
													value: valueAccessor(),
													visibleData: visibleData(),
													getGroupProps,
													getArcProps,
													seriesIndex: i,
													props: getArcProps(s, i)
												});

												$$renderer.push(`<!---->`);
											} else if (labelsConfig()) {
												$$renderer.push('<!--[1-->');

												const arcProps = getArcProps(s, i);

												{
													function children(
														$$renderer,
														{
															centroid,
															startAngle,
															endAngle,
															innerRadius: arcInnerRadius,
															outerRadius: arcOuterRadius,
															getArcTextProps
														}
													) {
														const { value: labelValue, ...labelRest } = labelsConfig();

														if (ArcLabel) {
															$$renderer.push('<!--[-->');

															ArcLabel($$renderer, $.spread_props([
																{
																	centroid,
																	startAngle,
																	endAngle,
																	innerRadius: arcInnerRadius,
																	outerRadius: arcOuterRadius,
																	getArcTextProps,
																	value: accessor(labelValue ?? value)(s.data?.[0] || chartData()[0])
																},
																labelRest
															]));

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													if (Arc) {
														$$renderer.push('<!--[-->');
														Arc($$renderer, $.spread_props([arcProps, { children, $$slots: { default: true } }]));
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											} else {
												$$renderer.push('<!--[-1-->');

												if (Arc) {
													$$renderer.push('<!--[-->');
													Arc($$renderer, $.spread_props([getArcProps(s, i)]));
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`<!--]-->`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				function tooltip($$renderer, snippetProps) {
					if (typeof tooltipProp === 'function') {
						$$renderer.push('<!--[0-->');
						tooltipProp($$renderer, snippetProps);
						$$renderer.push(`<!---->`);
					} else if (tooltipContext) {
						$$renderer.push('<!--[1-->');

						{
							function children($$renderer, { data }) {
								if (Tooltip.List) {
									$$renderer.push('<!--[-->');

									Tooltip.List($$renderer, $.spread_props([
										props.tooltip?.list,
										{
											children: ($$renderer) => {
												if (Tooltip.Item) {
													$$renderer.push('<!--[-->');

													Tooltip.Item($$renderer, $.spread_props([
														{
															label: labelAccessor()(data) || keyAccessor()(data),
															value: valueAccessor()(data),
															color: snippetProps.context.cScale?.(snippetProps.context.c(data)),
															format,
															onpointerenter: () => {
																if (snippetProps.context) snippetProps.context.series.highlightKey = keyAccessor()(data);
															},

															onpointerleave: () => {
																if (snippetProps.context) snippetProps.context.series.highlightKey = null;
															}
														},
														props.tooltip?.item
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										}
									]));

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							if (Tooltip.Root) {
								$$renderer.push('<!--[-->');

								Tooltip.Root($$renderer, $.spread_props([
									{ context: snippetProps.context },
									props.tooltip?.root,
									{ children, $$slots: { default: true } }
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				if (Chart) {
					$$renderer.push('<!--[-->');

					Chart($$renderer, $.spread_props([
						{
							data: visibleData(),
							x: value,
							c: c(),
							cDomain: chartData().map(keyAccessor()),
							cRange: allSeriesColors().length > 0
								? allSeriesColors()
								: c() !== key
									? chartData().map((d) => cAccessor()(d))
									: [
										'var(--color-primary, currentColor)',
										'var(--color-secondary, currentColor)',
										'var(--color-info, currentColor)',
										'var(--color-success, currentColor)',
										'var(--color-warning, currentColor)',
										'var(--color-danger, currentColor)'
									],

							padding: {
								bottom: legend === true || getObjectOrNull(legend)?.placement?.includes('bottom') ? 32 : 0
							},
							axis: false,
							grid: false
						},
						restProps,
						{
							tooltipContext: tooltipContext === false
								? false
								: {
									onclick: onTooltipClick,
									...props.tooltip?.context,
									...typeof tooltipContext === 'object' ? tooltipContext : null
								},
							series: series(),
							legend: typeof legend === 'function'
								? legend
								: legend
									? {
										variant: 'swatches',
										placement: 'bottom',
										tickFormat: legendTickFormat,
										...typeof legend === 'object' ? legend : null
									}
									: false,

							props: {
								...props,
								svg: { center: center(), ...props.svg },
								canvas: { center: center(), ...props.canvas }
							},

							get context() {
								return context;
							},

							set context($$value) {
								context = $$value;
								$$settled = false;
							},
							marks,
							tooltip,
							$$slots: { marks: true, tooltip: true }
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