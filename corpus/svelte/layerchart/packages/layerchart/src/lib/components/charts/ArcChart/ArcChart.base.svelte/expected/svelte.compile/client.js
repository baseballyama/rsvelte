import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { sum } from 'd3-array';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import * as Tooltip from '../../tooltip/index.js';
import { accessor, chartDataArray, getObjectOrNull } from '$lib/utils/common.js';
import { getColorIfDefined } from '$lib/utils/color.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Chart',
	'Arc',
	'ArcLabel',
	'Group',
	'data',
	'key',
	'label',
	'value',
	'range',
	'c',
	'innerRadius',
	'outerRadius',
	'cornerRadius',
	'padAngle',
	'placement',
	'maxValue',
	'center',
	'series',
	'legend',
	'onArcClick',
	'onTooltipClick',
	'props',
	'profile',
	'tooltipContext',
	'marks',
	'tooltip',
	'arc',
	'labels',
	'context',
	'trackCornerRadius',
	'trackPadAngle',
	'trackStartAngle',
	'trackEndAngle',
	'trackInnerRadius',
	'trackOuterRadius'
]);

export default function ArcChart_base($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 19, () => []),
		key = $.prop($$props, 'key', 3, 'key'),
		label = $.prop($$props, 'label', 3, 'label'),
		value = $.prop($$props, 'value', 3, 'value'),
		range = $.prop($$props, 'range', 19, () => [0, 360]),
		innerRadius = $.prop($$props, 'innerRadius', 3, 0),
		outerRadius = $.prop($$props, 'outerRadius', 3, 0),
		cornerRadius = $.prop($$props, 'cornerRadius', 3, 0),
		padAngle = $.prop($$props, 'padAngle', 3, 0),
		placement = $.prop($$props, 'placement', 3, 'center'),
		legend = $.prop($$props, 'legend', 3, false),
		onArcClick = $.prop($$props, 'onArcClick', 3, () => {}),
		// TODO: Not usable with manual tooltip / arc path.  Use `onArcClick`?
		/** Event dispatched with current tooltip data */
		onTooltipClick = $.prop($$props, 'onTooltipClick', 3, () => {}),
		props = $.prop($$props, 'props', 19, () => ({})),
		profile = $.prop($$props, 'profile', 3, false),
		tooltipContext = $.prop($$props, 'tooltipContext', 3, true),
		labels = $.prop($$props, 'labels', 3, false),
		context = $.prop($$props, 'context', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const center = $.derived(() => $$props.center ?? placement() === 'center');
	const labelsConfig = $.derived(() => labels() === true ? {} : labels() || null);
	const c = $.derived(() => $$props.c ?? key());
	const keyAccessor = $.derived(() => accessor(key()));
	const labelAccessor = $.derived(() => accessor(label()));
	const valueAccessor = $.derived(() => accessor(value()));
	const cAccessor = $.derived(() => accessor($.get(c)));
	const _series = $.derived(() => $$props.series === undefined ? [{ key: 'default', value: value() }] : $$props.series);
	const isDefaultSeries = $.derived(() => $.get(_series).length === 1 && $.get(_series)[0].key === 'default');

	const series = $.derived(() => {
		if (!$.get(isDefaultSeries)) return $.get(_series);

		// build series from data
		return chartDataArray(data()).map((d) => {
			return {
				key: $.get(keyAccessor)(d),
				value: $.get(valueAccessor)(d),
				label: $.get(labelAccessor)(d),
				color: getColorIfDefined(d),
				maxValue: $$props.maxValue,
				data: [d]
			};
		});
	});

	// ArcChart needs local chartData for visibleData filtering and cDomain calculation.
	// IMPORTANT: Compute locally from `series` and `data` — NOT from `context.series.allSeriesData`.
	// Reading context.series.allSeriesData here would create a derived_references_self cycle:
	//   SeriesState.#series → ChartState.props → data={visibleData} → chartData → context.series.allSeriesData → #series
	const chartData = $.derived(() => {
		const seriesData = $.get(series).flatMap((s) => s.data ?? []);

		return seriesData.length > 0 ? seriesData : chartDataArray(data());
	});

	const visibleData = $.derived(() => $.get(chartData).filter((d) => {
		const dataKey = $.get(keyAccessor)(d);
		const selectedKeys = context()?.series.selectedKeys;

		return !selectedKeys || selectedKeys.isEmpty() || selectedKeys.isSelected(dataKey);
	}));

	// Compute series colors locally to avoid derived_references_self cycle through context.series.allSeriesColors
	const allSeriesColors = $.derived(() => $.get(series).map((s) => s.color).filter((c) => c != null));

	// Custom tickFormat for ArcChart legends - uses data labels instead of series labels
	const legendTickFormat = (tick) => {
		const item = $.get(chartData).find((d) => $.get(keyAccessor)(d) === tick);

		return item ? $.get(labelAccessor)(item) ?? tick : tick;
	};

	function getGroupProps() {
		if (!context()) return {};

		return {
			x: placement() === 'left'
				? context().height / 2
				: placement() === 'right' ? context().width - context().height / 2 : undefined,
			center: ['left', 'right'].includes(placement()) ? 'y' : undefined,
			...props().group
		};
	}

	function getArcProps(s, i) {
		if (!context()) return {};

		const d = s.data?.[0] || $.get(chartData)[0];
		const multiSeries = chartDataArray(data()).length > 1 || $.get(series).length > 1;

		return {
			value: $.get(valueAccessor)(d),
			domain: [
				0,
				s.maxValue ?? $$props.maxValue ?? sum($.get(chartData), $.get(valueAccessor))
			],
			range: range(),
			innerRadius: innerRadius(),
			outerRadius: multiSeries && (outerRadius() ?? 0) < 0 ? i * (outerRadius() ?? 0) : outerRadius(),
			cornerRadius: cornerRadius(),
			padAngle: padAngle(),
			trackCornerRadius: $$props.trackCornerRadius,
			trackPadAngle: $$props.trackPadAngle,
			trackStartAngle: $$props.trackStartAngle,
			trackEndAngle: $$props.trackEndAngle,
			trackInnerRadius: $$props.trackInnerRadius,
			trackOuterRadius: multiSeries && ($$props.trackOuterRadius ?? 0) < 0
				? i * ($$props.trackOuterRadius ?? 0)
				: $$props.trackOuterRadius,
			fill: s.color ?? context().cScale?.(context().c(d)),
			track: {
				fill: s.color ?? context().cScale?.(context().c(d)),
				fillOpacity: 0.1
			},
			opacity: context()?.series.isHighlighted($.get(keyAccessor)(d), true) ?? true ? 1 : 0.1,
			tooltip: true,
			data: d,
			onclick: (e) => {
				onArcClick()(e, { data: d, series: s });

				// Workaround for `tooltip={{ mode: 'manual' }}
				onTooltipClick()(e, { data: d });
			},
			...props().arc,
			...s.props,
			class: cls(props().arc?.class, s.props?.class)
		};
	}

	if (profile()) {
		console.time('ArcChart render');

		onMount(() => {
			console.timeEnd('ArcChart render');
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const marks = ($$anchor, snippetProps = $.noop) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					$$props.marks($$anchor, snippetProps);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					{
						let $0 = $.derived(getGroupProps);

						$.component(node_2, () => $$props.Group, ($$anchor, Group_1) => {
							Group_1($$anchor, $.spread_props(() => $.get($0), {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.each(node_3, 19, () => $.get(series), (s) => s.key, ($$anchor, s, i) => {
										var fragment_5 = $.comment();
										var node_4 = $.first_child(fragment_5);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_6 = $.comment();
												var node_5 = $.first_child(fragment_6);

												{
													let $0 = $.derived(() => ({
														...snippetProps(),
														label: $.get(labelAccessor),
														key: $.get(keyAccessor),
														value: $.get(valueAccessor),
														visibleData: $.get(visibleData),
														getGroupProps,
														getArcProps,
														seriesIndex: $.get(i),
														props: getArcProps($.get(s), $.get(i))
													}));

													$.snippet(node_5, () => $$props.arc, () => $.get($0));
												}

												$.append($$anchor, fragment_6);
											};

											var consequent_2 = ($$anchor) => {
												const arcProps = $.derived(() => getArcProps($.get(s), $.get(i)));
												var fragment_7 = $.comment();
												var node_6 = $.first_child(fragment_7);

												{
													const children = ($$anchor, $$arg0) => {
														let centroid = () => ($$arg0?.()).centroid;
														let startAngle = () => ($$arg0?.()).startAngle;
														let endAngle = () => ($$arg0?.()).endAngle;
														let arcInnerRadius = () => ($$arg0?.()).innerRadius;
														let arcOuterRadius = () => ($$arg0?.()).outerRadius;
														let getArcTextProps = () => ($$arg0?.()).getArcTextProps;

														const computed_const = $.derived(() => {
															const { value: labelValue, ...labelRest } = $.get(labelsConfig);

															return { labelValue, labelRest };
														});

														var fragment_8 = $.comment();
														var node_7 = $.first_child(fragment_8);

														{
															let $0 = $.derived(() => accessor($.get(computed_const).labelValue ?? value())($.get(s).data?.[0] || $.get(chartData)[0]));

															$.component(node_7, () => $$props.ArcLabel, ($$anchor, ArcLabel_1) => {
																ArcLabel_1($$anchor, $.spread_props(
																	{
																		get centroid() {
																			return centroid();
																		},

																		get startAngle() {
																			return startAngle();
																		},

																		get endAngle() {
																			return endAngle();
																		},

																		get innerRadius() {
																			return arcInnerRadius();
																		},

																		get outerRadius() {
																			return arcOuterRadius();
																		},

																		get getArcTextProps() {
																			return getArcTextProps();
																		},

																		get value() {
																			return $.get($0);
																		}
																	},
																	() => $.get(computed_const).labelRest
																));
															});
														}

														$.append($$anchor, fragment_8);
													};

													$.component(node_6, () => $$props.Arc, ($$anchor, Arc_1) => {
														Arc_1($$anchor, $.spread_props(() => $.get(arcProps), { children, $$slots: { default: true } }));
													});
												}

												$.append($$anchor, fragment_7);
											};

											var alternate = ($$anchor) => {
												var fragment_9 = $.comment();
												var node_8 = $.first_child(fragment_9);

												{
													let $0 = $.derived(() => getArcProps($.get(s), $.get(i)));

													$.component(node_8, () => $$props.Arc, ($$anchor, Arc_2) => {
														Arc_2($$anchor, $.spread_props(() => $.get($0)));
													});
												}

												$.append($$anchor, fragment_9);
											};

											$.if(node_4, ($$render) => {
												if (typeof $$props.arc === 'function') $$render(consequent_1); else if ($.get(labelsConfig)) $$render(consequent_2, 1); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_5);
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							}));
						});
					}

					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if (typeof $$props.marks === 'function') $$render(consequent); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		const tooltip = ($$anchor, snippetProps = $.noop) => {
			var fragment_10 = $.comment();
			var node_9 = $.first_child(fragment_10);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_11 = $.comment();
					var node_10 = $.first_child(fragment_11);

					$.snippet(node_10, () => $$props.tooltip, snippetProps);
					$.append($$anchor, fragment_11);
				};

				var consequent_4 = ($$anchor) => {
					var fragment_12 = $.comment();
					var node_11 = $.first_child(fragment_12);

					{
						const children = ($$anchor, $$arg0) => {
							let data = () => ($$arg0?.()).data;
							var fragment_13 = $.comment();
							var node_12 = $.first_child(fragment_13);

							$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, $.spread_props(() => props().tooltip?.list, {
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = $.comment();
										var node_13 = $.first_child(fragment_14);

										{
											let $0 = $.derived(() => $.get(labelAccessor)(data()) || $.get(keyAccessor)(data()));
											let $1 = $.derived(() => $.get(valueAccessor)(data()));
											let $2 = $.derived(() => snippetProps().context.cScale?.(snippetProps().context.c(data())));

											$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, $.spread_props(
													{
														get label() {
															return $.get($0);
														},

														get value() {
															return $.get($1);
														},

														get color() {
															return $.get($2);
														},

														get format() {
															return format;
														},

														onpointerenter: () => {
															if (snippetProps().context) snippetProps().context.series.highlightKey = $.get(keyAccessor)(data());
														},

														onpointerleave: () => {
															if (snippetProps().context) snippetProps().context.series.highlightKey = null;
														}
													},
													() => props().tooltip?.item
												));
											});
										}

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_13);
						};

						$.component(node_11, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
							Tooltip_Root($$anchor, $.spread_props(
								{
									get context() {
										return snippetProps().context;
									}
								},
								() => props().tooltip?.root,
								{ children, $$slots: { default: true } }
							));
						});
					}

					$.append($$anchor, fragment_12);
				};

				$.if(node_9, ($$render) => {
					if (typeof $$props.tooltip === 'function') $$render(consequent_3); else if (tooltipContext()) $$render(consequent_4, 1);
				});
			}

			$.append($$anchor, fragment_10);
		};

		let $0 = $.derived(() => $.get(chartData).map($.get(keyAccessor)));

		let $1 = $.derived(() => $.get(allSeriesColors).length > 0
			? $.get(allSeriesColors)
			: $.get(c) !== key()
				? $.get(chartData).map((d) => $.get(cAccessor)(d))
				: [
					'var(--color-primary, currentColor)',
					'var(--color-secondary, currentColor)',
					'var(--color-info, currentColor)',
					'var(--color-success, currentColor)',
					'var(--color-warning, currentColor)',
					'var(--color-danger, currentColor)'
				]);

		let $2 = $.derived(() => ({
			bottom: legend() === true || getObjectOrNull(legend())?.placement?.includes('bottom') ? 32 : 0
		}));

		let $3 = $.derived(() => tooltipContext() === false
			? false
			: {
				onclick: onTooltipClick(),
				...props().tooltip?.context,
				...typeof tooltipContext() === 'object' ? tooltipContext() : null
			});

		let $4 = $.derived(() => typeof legend() === 'function'
			? legend()
			: legend()
				? {
					variant: 'swatches',
					placement: 'bottom',
					tickFormat: legendTickFormat,
					...typeof legend() === 'object' ? legend() : null
				}
				: false);

		let $5 = $.derived(() => ({
			...props(),
			svg: { center: $.get(center), ...props().svg },
			canvas: { center: $.get(center), ...props().canvas }
		}));

		$.component(node, () => $$props.Chart, ($$anchor, Chart_1) => {
			Chart_1($$anchor, $.spread_props(
				{
					get data() {
						return $.get(visibleData);
					},

					get x() {
						return value();
					},

					get c() {
						return $.get(c);
					},

					get cDomain() {
						return $.get($0);
					},

					get cRange() {
						return $.get($1);
					},

					get padding() {
						return $.get($2);
					},
					axis: false,
					grid: false
				},
				() => restProps,
				{
					get tooltipContext() {
						return $.get($3);
					},

					get series() {
						return $.get(series);
					},

					get legend() {
						return $.get($4);
					},

					get props() {
						return $.get($5);
					},

					get context() {
						return context();
					},

					set context($$value) {
						context($$value);
					},
					marks,
					tooltip,
					$$slots: { marks: true, tooltip: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}