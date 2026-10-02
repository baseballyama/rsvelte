import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { format } from '@layerstack/utils';
import { schemeObservable10 } from 'd3-scale-chromatic';
import * as Tooltip from '../../tooltip/index.js';
import { accessor, chartDataArray, getObjectOrNull } from '$lib/utils/common.js';

export default function PieChart_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Chart,
			Arc,
			ArcLabel,
			Group,
			Pie,
			data = [],
			key = 'key',
			label = 'label',
			value = 'value',
			range = [0, 360],
			c = key,
			innerRadius,
			outerRadius,
			cornerRadius = 0,
			padAngle = 0,
			placement = 'center',
			maxValue,
			center = placement === 'center',
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
			pie,
			arc,
			labels = false,
			context = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const labelsConfig = $.derived(() => {
			if (labels === true) return { placement: 'callout' };
			if (labels) return { placement: 'callout', ...labels };

			return null;
		});

		const series = $.derived(() => seriesProp === undefined ? [{ key: 'default', value }] : seriesProp);
		const keyAccessor = $.derived(() => accessor(key));
		const labelAccessor = $.derived(() => accessor(label));
		const valueAccessor = $.derived(() => accessor(value));
		const cAccessor = $.derived(() => accessor(c));

		// PieChart needs local chartData for visibleData filtering and cDomain calculation.
		// IMPORTANT: Compute locally from `series` and `data` — NOT from `context.series.allSeriesData`.
		// Reading context.series.allSeriesData here would create a derived_references_self cycle:
		//   SeriesState.#series → ChartState.props → data={visibleData} → chartData → context.series.allSeriesData → #series
		const chartData = $.derived(() => {
			const seriesData = series().flatMap((s) => ('data' in s ? s.data : undefined) ?? []);

			return seriesData.length > 0 ? seriesData : chartDataArray(data);
		});

		const visibleData = $.derived(() => chartData().filter((d) => {
			const dataKey = keyAccessor()(d);
			const selectedKeys = context?.series.selectedKeys;

			return !selectedKeys || selectedKeys.isEmpty() || selectedKeys.isSelected(dataKey);
		}));

		// Compute series colors locally to avoid derived_references_self cycle through context.series.allSeriesColors
		const allSeriesColors = $.derived(() => series().map((s) => 'color' in s ? s.color : undefined).filter((c) => c != null));

		// Custom tickFormat for PieChart legends - uses data labels instead of series labels
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

		function getPieProps(s, i) {
			return {
				data: s.data,
				range,
				innerRadius,
				outerRadius,
				cornerRadius,
				padAngle,
				...props.pie
			};
		}

		function getArcProps(s, seriesIndex, arc, arcIndex) {
			if (!context) return {};

			const arcDataProps = 'props' in arc.data && typeof arc.data.props === 'object' ? arc.data.props : {};

			return {
				startAngle: arc.startAngle,
				endAngle: arc.endAngle,
				outerRadius: (context?.series.visibleSeries.length ?? 0) > 1 ? seriesIndex * (outerRadius ?? 0) : outerRadius,
				innerRadius,
				cornerRadius,
				padAngle,
				fill: context.cScale?.(context.c(arc.data)),
				data: arc.data,
				tooltip: true,
				onclick: (e) => {
					onArcClick(e, { data: arc.data, series: s });

					// Workaround for `tooltip={{ mode: 'manual' }}
					onTooltipClick(e, { data: arc.data });
				},
				opacity: context?.series.isHighlighted(keyAccessor()(arc.data), true) ?? true ? 1 : 0.5,
				...props.arc,
				...s.props,
				...arcDataProps
			};
		}

		if (profile) {
			console.time('PieChart render');

			onMount(() => {
				console.timeEnd('PieChart render');
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

										for (let seriesIdx = 0, $$length = each_array.length; seriesIdx < $$length; seriesIdx++) {
											let s = each_array[seriesIdx];

											if (typeof pie === 'function') {
												$$renderer.push('<!--[0-->');

												pie($$renderer, {
													...snippetProps,
													label: labelAccessor(),
													key: keyAccessor(),
													value: valueAccessor(),
													visibleData: visibleData(),
													getGroupProps,
													props: getPieProps(s, seriesIdx),
													index: seriesIdx
												});

												$$renderer.push(`<!---->`);
											} else {
												$$renderer.push('<!--[-1-->');

												{
													function children($$renderer, { arcs }) {
														$$renderer.push(`<!--[-->`);

														const each_array_1 = $.ensure_array_like(arcs);

														for (let arcIdx = 0, $$length = each_array_1.length; arcIdx < $$length; arcIdx++) {
															let arcData = each_array_1[arcIdx];
															const arcProps = getArcProps(s, seriesIdx, arcData, arcIdx);

															if (typeof arc === 'function') {
																$$renderer.push('<!--[0-->');

																arc($$renderer, {
																	...snippetProps,
																	label: labelAccessor(),
																	key: keyAccessor(),
																	value: valueAccessor(),
																	visibleData: visibleData(),
																	getGroupProps,
																	props: arcProps,
																	index: arcIdx,
																	seriesIndex: seriesIdx
																});

																$$renderer.push(`<!---->`);
															} else if (labelsConfig()) {
																$$renderer.push('<!--[1-->');

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
																					value: accessor(labelValue ?? value)(arcData.data)
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
																	Arc($$renderer, $.spread_props([arcProps]));
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

													if (Pie) {
														$$renderer.push('<!--[-->');

														Pie($$renderer, $.spread_props([
															getPieProps(s, seriesIdx),
															{ children, $$slots: { default: true } }
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
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
							c: key,
							cDomain: chartData().map(keyAccessor()),
							cRange: allSeriesColors().length > 0
								? allSeriesColors()
								: c !== key
									? chartData().map((d) => cAccessor()(d))
									: [
										`var(--color-primary, ${schemeObservable10[0]})`,
										`var(--color-secondary, ${schemeObservable10[1]})`,
										`var(--color-info, ${schemeObservable10[2]})`,
										`var(--color-success, ${schemeObservable10[3]})`,
										`var(--color-warning, ${schemeObservable10[4]})`,
										`var(--color-danger, ${schemeObservable10[5]})`
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
								svg: { center, ...props.svg },
								canvas: { center, ...props.canvas }
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