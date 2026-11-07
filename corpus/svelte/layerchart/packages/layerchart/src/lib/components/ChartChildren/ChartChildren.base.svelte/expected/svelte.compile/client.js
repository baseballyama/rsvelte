import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { getSettings } from '$lib/contexts/settings.js';
import FacetAxis from '../FacetAxis.svelte';
import { asAny } from '$lib/utils/types.js';
import { getObjectOrNull } from '$lib/utils/common.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function ChartChildren_base($$anchor, $$props) {
	$.push($$props, true);

	const context = getChartContext();
	const settings = getSettings();

	let props = $.prop($$props, 'props', 19, () => ({})),
		grid = $.prop($$props, 'grid', 3, true),
		axis = $.prop($$props, 'axis', 3, true),
		rule = $.prop($$props, 'rule', 3, true),
		points = $.prop($$props, 'points', 3, false),
		labels = $.prop($$props, 'labels', 3, false),
		highlight = $.prop($$props, 'highlight', 3, true),
		annotations = $.prop($$props, 'annotations', 19, () => []);

	let snippetProps = $.derived(() => ({ context }));
	let layer = $.derived(() => settings.layer);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => $.get(snippetProps));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_3();
			var node_2 = $.first_child(fragment_2);

			$.snippet(node_2, () => $$props.belowContext ?? $.noop, () => $.get(snippetProps));

			var node_3 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let facet = () => ($$arg0?.()).facet;
					const layerProps = $.derived(() => ({ context, facet: facet() }));
					var fragment_3 = root_3();
					var node_4 = $.first_child(fragment_3);

					FacetAxis(node_4, {});

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.snippet(node_6, grid, () => $.get(layerProps));
							$.append($$anchor, fragment_4);
						};

						var consequent_2 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							{
								let $0 = $.derived(() => context.valueAxis === 'x' || context.radial);
								let $1 = $.derived(() => context.valueAxis === 'y' || context.radial);
								let $2 = $.derived(() => getObjectOrNull(grid()));

								$.component(node_7, () => $$props.Grid, ($$anchor, Grid_1) => {
									Grid_1($$anchor, $.spread_props(
										{
											get x() {
												return $.get($0);
											},

											get y() {
												return $.get($1);
											}
										},
										() => $.get($2),
										() => props().grid
									));
								});
							}

							$.append($$anchor, fragment_5);
						};

						$.if(node_5, ($$render) => {
							if (typeof grid() === 'function') $$render(consequent_1); else if (grid()) $$render(consequent_2, 1);
						});
					}

					var node_8 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => !context.props.brush && context.transformState?.mode !== 'domain');

						$.component(node_8, () => $$props.ChartClipPath, ($$anchor, ChartClipPath_1) => {
							ChartClipPath_1($$anchor, {
								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_9 = $.first_child(fragment_6);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_7 = $.comment();
											var node_10 = $.first_child(fragment_7);

											$.await(node_10, () => import('../charts/ChartAnnotations.svelte'), null, ($$anchor, $$source) => {
												var $$value = $.derived(() => {
													var { default: ChartAnnotations } = $.get($$source);

													return { ChartAnnotations };
												});

												var ChartAnnotations = $.derived(() => $.get($$value).ChartAnnotations);
												var fragment_8 = $.comment();
												var node_11 = $.first_child(fragment_8);

												$.component(node_11, () => $.get(ChartAnnotations), ($$anchor, ChartAnnotations_1) => {
													ChartAnnotations_1($$anchor, {
														get annotations() {
															return annotations();
														},
														layer: 'below'
													});
												});

												$.append($$anchor, fragment_8);
											});

											$.append($$anchor, fragment_7);
										};

										$.if(node_9, ($$render) => {
											if (annotations().length > 0) $$render(consequent_3);
										});
									}

									var node_12 = $.sibling(node_9, 2);

									$.snippet(node_12, () => $$props.belowMarks ?? $.noop, () => $.get(layerProps));

									var node_13 = $.sibling(node_12, 2);

									$.snippet(node_13, () => $$props.marks ?? $.noop, () => $.get(layerProps));

									var node_14 = $.sibling(node_13, 2);

									$.snippet(node_14, () => $$props.aboveMarks ?? $.noop, () => $.get(layerProps));
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});
					}

					var node_15 = $.sibling(node_8, 2);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_9 = root_1();
							var node_16 = $.first_child(fragment_9);

							$.snippet(node_16, axis, () => $.get(layerProps));

							var node_17 = $.sibling(node_16, 2);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_10 = $.comment();
									var node_18 = $.first_child(fragment_10);

									$.snippet(node_18, rule, () => $.get(layerProps));
									$.append($$anchor, fragment_10);
								};

								var consequent_5 = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_19 = $.first_child(fragment_11);

									{
										let $0 = $.derived(() => context.valueAxis === 'x' ? 0 : false);
										let $1 = $.derived(() => context.valueAxis === 'y' ? 0 : false);
										let $2 = $.derived(() => getObjectOrNull(rule()));

										$.component(node_19, () => $$props.Rule, ($$anchor, Rule_1) => {
											Rule_1($$anchor, $.spread_props(
												{
													get x() {
														return $.get($0);
													},

													get y() {
														return $.get($1);
													}
												},
												() => $.get($2),
												() => props().rule
											));
										});
									}

									$.append($$anchor, fragment_11);
								};

								$.if(node_17, ($$render) => {
									if (typeof rule() === 'function') $$render(consequent_4); else if (rule()) $$render(consequent_5, 1);
								});
							}

							$.append($$anchor, fragment_9);
						};

						var consequent_11 = ($$anchor) => {
							var fragment_12 = root_2();
							var node_20 = $.first_child(fragment_12);

							{
								var consequent_7 = ($$anchor) => {
									var fragment_13 = $.comment();
									var node_21 = $.first_child(fragment_13);

									{
										let $0 = $.derived(() => context.radial ? 'radius' : 'left');
										let $1 = $.derived(() => getObjectOrNull(axis()));

										$.component(node_21, () => $$props.Axis, ($$anchor, Axis_1) => {
											Axis_1($$anchor, $.spread_props(
												{
													get placement() {
														return $.get($0);
													}
												},
												() => $.get($1),
												() => props().yAxis
											));
										});
									}

									$.append($$anchor, fragment_13);
								};

								$.if(node_20, ($$render) => {
									if (axis() !== 'x') $$render(consequent_7);
								});
							}

							var node_22 = $.sibling(node_20, 2);

							{
								var consequent_8 = ($$anchor) => {
									var fragment_14 = $.comment();
									var node_23 = $.first_child(fragment_14);

									{
										let $0 = $.derived(() => context.radial ? 'angle' : 'bottom');
										let $1 = $.derived(() => getObjectOrNull(axis()));

										$.component(node_23, () => $$props.Axis, ($$anchor, Axis_2) => {
											Axis_2($$anchor, $.spread_props(
												{
													get placement() {
														return $.get($0);
													}
												},
												() => $.get($1),
												() => props().xAxis
											));
										});
									}

									$.append($$anchor, fragment_14);
								};

								$.if(node_22, ($$render) => {
									if (axis() !== 'y') $$render(consequent_8);
								});
							}

							var node_24 = $.sibling(node_22, 2);

							{
								var consequent_9 = ($$anchor) => {
									var fragment_15 = $.comment();
									var node_25 = $.first_child(fragment_15);

									$.snippet(node_25, rule, () => $.get(layerProps));
									$.append($$anchor, fragment_15);
								};

								var consequent_10 = ($$anchor) => {
									var fragment_16 = $.comment();
									var node_26 = $.first_child(fragment_16);

									{
										let $0 = $.derived(() => context.valueAxis === 'x' ? 0 : false);
										let $1 = $.derived(() => context.valueAxis === 'y' ? 0 : false);
										let $2 = $.derived(() => getObjectOrNull(rule()));

										$.component(node_26, () => $$props.Rule, ($$anchor, Rule_2) => {
											Rule_2($$anchor, $.spread_props(
												{
													get x() {
														return $.get($0);
													},

													get y() {
														return $.get($1);
													}
												},
												() => $.get($2),
												() => props().rule
											));
										});
									}

									$.append($$anchor, fragment_16);
								};

								$.if(node_24, ($$render) => {
									if (typeof rule() === 'function') $$render(consequent_9); else if (rule()) $$render(consequent_10, 1);
								});
							}

							$.append($$anchor, fragment_12);
						};

						$.if(node_15, ($$render) => {
							if (typeof axis() === 'function') $$render(consequent_6); else if (axis()) $$render(consequent_11, 1);
						});
					}

					var node_27 = $.sibling(node_15, 2);

					{
						let $0 = $.derived(() => !context.props.brush && context.transformState?.mode !== 'domain');

						$.component(node_27, () => $$props.ChartClipPath, ($$anchor, ChartClipPath_2) => {
							ChartClipPath_2($$anchor, {
								get disabled() {
									return $.get($0);
								},
								full: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root();
									var node_28 = $.first_child(fragment_17);

									{
										var consequent_12 = ($$anchor) => {
											var fragment_18 = $.comment();
											var node_29 = $.first_child(fragment_18);

											$.snippet(node_29, points, () => $.get(layerProps));
											$.append($$anchor, fragment_18);
										};

										var consequent_13 = ($$anchor) => {
											var fragment_19 = $.comment();
											var node_30 = $.first_child(fragment_19);

											$.await(node_30, () => import('../Points/Points.svelte'), null, ($$anchor, $$source) => {
												var $$value = $.derived(() => {
													var { default: Points } = $.get($$source);

													return { Points };
												});

												var Points = $.derived(() => $.get($$value).Points);
												var fragment_20 = $.comment();
												var node_31 = $.first_child(fragment_20);

												$.each(node_31, 19, () => context.series.visibleSeries, (s) => s.key, ($$anchor, s) => {
													var fragment_21 = $.comment();
													var node_32 = $.first_child(fragment_21);

													{
														let $0 = $.derived(() => getObjectOrNull(points()));

														$.component(node_32, () => $.get(Points), ($$anchor, Points_1) => {
															Points_1($$anchor, $.spread_props(
																{
																	get seriesKey() {
																		return $.get(s).key;
																	},
																	stroke: 'var(--color-surface-100, light-dark(white, black))'
																},
																() => $.get($0),
																() => props().points
															));
														});
													}

													$.append($$anchor, fragment_21);
												});

												$.append($$anchor, fragment_20);
											});

											$.append($$anchor, fragment_19);
										};

										$.if(node_28, ($$render) => {
											if (typeof points() === 'function') $$render(consequent_12); else if (points()) $$render(consequent_13, 1);
										});
									}

									var node_33 = $.sibling(node_28, 2);

									{
										var consequent_14 = ($$anchor) => {
											var fragment_22 = $.comment();
											var node_34 = $.first_child(fragment_22);

											$.snippet(node_34, labels, () => $.get(layerProps));
											$.append($$anchor, fragment_22);
										};

										var consequent_15 = ($$anchor) => {
											var fragment_23 = $.comment();
											var node_35 = $.first_child(fragment_23);

											$.await(node_35, () => import('../Labels/Labels.svelte'), null, ($$anchor, $$source) => {
												var $$value = $.derived(() => {
													var { default: Labels } = $.get($$source);

													return { Labels };
												});

												var Labels = $.derived(() => $.get($$value).Labels);
												const labelSeriesKey = $.derived(() => typeof labels() === 'object' ? labels().seriesKey : undefined);
												var fragment_24 = $.comment();
												var node_36 = $.first_child(fragment_24);

												$.each(node_36, 19, () => context.series.visibleSeries.filter((s) => !$.get(labelSeriesKey) || s.key === $.get(labelSeriesKey)), (s) => s.key, ($$anchor, s) => {
													var fragment_25 = $.comment();
													var node_37 = $.first_child(fragment_25);

													{
														let $0 = $.derived(() => getObjectOrNull(labels()));

														$.component(node_37, () => $.get(Labels), ($$anchor, Labels_1) => {
															Labels_1($$anchor, $.spread_props(
																{
																	get seriesKey() {
																		return $.get(s).key;
																	}
																},
																() => $.get($0),
																() => props().labels
															));
														});
													}

													$.append($$anchor, fragment_25);
												});

												$.append($$anchor, fragment_24);
											});

											$.append($$anchor, fragment_23);
										};

										$.if(node_33, ($$render) => {
											if (typeof labels() === 'function') $$render(consequent_14); else if (labels()) $$render(consequent_15, 1);
										});
									}

									var node_38 = $.sibling(node_33, 2);

									{
										var consequent_16 = ($$anchor) => {
											var fragment_26 = $.comment();
											var node_39 = $.first_child(fragment_26);

											$.snippet(node_39, highlight, () => $.get(layerProps));
											$.append($$anchor, fragment_26);
										};

										var consequent_17 = ($$anchor) => {
											var fragment_27 = $.comment();
											var node_40 = $.first_child(fragment_27);

											$.component(node_40, () => $$props.Highlight, ($$anchor, Highlight_1) => {
												Highlight_1($$anchor, $.spread_props(() => typeof highlight() === 'object' ? highlight() : {}, () => props().highlight));
											});

											$.append($$anchor, fragment_27);
										};

										$.if(node_38, ($$render) => {
											if (typeof highlight() === 'function') $$render(consequent_16); else if (highlight()) $$render(consequent_17, 1);
										});
									}

									var node_41 = $.sibling(node_38, 2);

									{
										var consequent_18 = ($$anchor) => {
											var fragment_28 = $.comment();
											var node_42 = $.first_child(fragment_28);

											$.await(node_42, () => import('../charts/ChartAnnotations.svelte'), null, ($$anchor, $$source) => {
												var $$value = $.derived(() => {
													var { default: ChartAnnotations } = $.get($$source);

													return { ChartAnnotations };
												});

												var ChartAnnotations = $.derived(() => $.get($$value).ChartAnnotations);
												var fragment_29 = $.comment();
												var node_43 = $.first_child(fragment_29);

												$.component(node_43, () => $.get(ChartAnnotations), ($$anchor, ChartAnnotations_2) => {
													ChartAnnotations_2($$anchor, {
														get annotations() {
															return annotations();
														},
														layer: 'above'
													});
												});

												$.append($$anchor, fragment_29);
											});

											$.append($$anchor, fragment_28);
										};

										$.if(node_41, ($$render) => {
											if (annotations().length > 0) $$render(consequent_18);
										});
									}

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_3);
				};

				let $0 = $.derived(() => asAny($.get(layer) === 'canvas' ? props().canvas : props().svg));

				$.component(node_3, () => $$props.Layer, ($$anchor, Layer_1) => {
					Layer_1($$anchor, $.spread_props(
						{
							get type() {
								return $.get(layer);
							},

							get center() {
								return context.radial;
							}
						},
						() => $.get($0),
						{
							get debug() {
								return settings.debug;
							},
							children,
							$$slots: { default: true }
						}
					));
				});
			}

			var node_44 = $.sibling(node_3, 2);

			$.snippet(node_44, () => $$props.aboveContext ?? $.noop, () => $.get(snippetProps));

			var node_45 = $.sibling(node_44, 2);

			{
				var consequent_19 = ($$anchor) => {
					var fragment_30 = $.comment();
					var node_46 = $.first_child(fragment_30);

					$.snippet(node_46, () => $$props.legend, () => $.get(snippetProps));
					$.append($$anchor, fragment_30);
				};

				var consequent_20 = ($$anchor) => {
					var fragment_31 = $.comment();
					var node_47 = $.first_child(fragment_31);

					$.await(node_47, () => import('../Legend.svelte'), null, ($$anchor, $$source) => {
						var $$value = $.derived(() => {
							var { default: Legend } = $.get($$source);

							return { Legend };
						});

						var Legend = $.derived(() => $.get($$value).Legend);
						var fragment_32 = $.comment();
						var node_48 = $.first_child(fragment_32);

						{
							let $0 = $.derived(() => getObjectOrNull($$props.legend));

							$.component(node_48, () => $.get(Legend), ($$anchor, Legend_1) => {
								Legend_1($$anchor, $.spread_props({ placement: 'bottom' }, () => $.get($0), () => props().legend));
							});
						}

						$.append($$anchor, fragment_32);
					});

					$.append($$anchor, fragment_31);
				};

				$.if(node_45, ($$render) => {
					if (typeof $$props.legend === 'function') $$render(consequent_19); else if ($$props.legend) $$render(consequent_20, 1);
				});
			}

			var node_49 = $.sibling(node_45, 2);

			{
				var consequent_21 = ($$anchor) => {
					var fragment_33 = $.comment();
					var node_50 = $.first_child(fragment_33);

					$.snippet(node_50, () => $$props.tooltip, () => $.get(snippetProps));
					$.append($$anchor, fragment_33);
				};

				var consequent_22 = ($$anchor) => {
					var fragment_34 = $.comment();
					var node_51 = $.first_child(fragment_34);

					$.await(node_51, () => import('../charts/DefaultTooltip.svelte'), null, ($$anchor, $$source) => {
						var $$value = $.derived(() => {
							var { default: DefaultTooltip } = $.get($$source);

							return { DefaultTooltip };
						});

						var DefaultTooltip = $.derived(() => $.get($$value).DefaultTooltip);
						var fragment_35 = $.comment();
						var node_52 = $.first_child(fragment_35);

						$.component(node_52, () => $.get(DefaultTooltip), ($$anchor, DefaultTooltip_1) => {
							DefaultTooltip_1($$anchor, {
								get tooltipProps() {
									return props().tooltip;
								},
								canHaveTotal: true
							});
						});

						$.append($$anchor, fragment_35);
					});

					$.append($$anchor, fragment_34);
				};

				$.if(node_49, ($$render) => {
					if (typeof $$props.tooltip === 'function') $$render(consequent_21); else if ($$props.tooltipContext) $$render(consequent_22, 1);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}