import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveLinearClosed, pointRadial } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { GridState } from './Grid.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Line',
	'Circle',
	'Rule',
	'x',
	'y',
	'xTicks',
	'yTicks',
	'bandAlign',
	'radialY',
	'stroke',
	'motion',
	'transitionIn',
	'transitionInParams',
	'classes',
	'class',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Grid_base($$anchor, $$props) {
	$.push($$props, true);

	let x = $.prop($$props, 'x', 3, false),
		y = $.prop($$props, 'y', 3, false),
		bandAlign = $.prop($$props, 'bandAlign', 3, 'center'),
		radialY = $.prop($$props, 'radialY', 3, 'circle'),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new GridState(() => ({
		x: x(),
		y: y(),
		xTicks: $$props.xTicks,
		yTicks: $$props.yTicks,
		bandAlign: bandAlign(),
		radialY: radialY(),
		stroke: $$props.stroke,
		motion: $$props.motion,
		transitionIn: $$props.transitionIn,
		transitionInParams: $$props.transitionInParams,
		classes: classes()
	}));

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const transitionIn = $.derived(() => $$props.transitionIn ?? c.defaultTransitionIn);
	const transitionInParams = $.derived(() => $$props.transitionInParams ?? c.defaultTransitionInParams);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cls('lc-grid', classes().root, $$props.class));

		$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
			Group_1($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return $.get(ref);
					},

					set ref($$value) {
						$.set(ref, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent_2 = ($$anchor) => {
								const splineProps = $.derived(() => extractLayerProps(x(), 'lc-grid-x-line'));
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => $$props.Group, ($$anchor, Group_2) => {
									Group_2($$anchor, {
										get transitionIn() {
											return $.get(transitionIn);
										},

										get transitionInParams() {
											return $.get(transitionInParams);
										},
										class: 'lc-grid-x',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_3 = $.first_child(fragment_3);

											$.each(node_3, 16, () => c.xTickVals, (tick) => tick, ($$anchor, tick) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												{
													var consequent = ($$anchor) => {
														const computed_const = $.derived(() => {
															const [x1, y1] = pointRadial(c.ctx.xScale(tick), c.ctx.yRange[0]);

															return { x1, y1 };
														});

														const computed_const_1 = $.derived(() => {
															const [x2, y2] = pointRadial(c.ctx.xScale(tick), c.ctx.yRange[1]);

															return { x2, y2 };
														});

														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														{
															let $0 = $.derived(() => cls('lc-grid-x-radial-line', classes().line, $.get(splineProps)?.class));

															$.component(node_5, () => $$props.Line, ($$anchor, Line_1) => {
																Line_1($$anchor, $.spread_props(
																	{
																		get x1() {
																			return $.get(computed_const).x1;
																		},

																		get y1() {
																			return $.get(computed_const).y1;
																		},

																		get x2() {
																			return $.get(computed_const_1).x2;
																		},

																		get y2() {
																			return $.get(computed_const_1).y2;
																		},

																		get stroke() {
																			return $$props.stroke;
																		},

																		get motion() {
																			return c.tweenConfig;
																		}
																	},
																	() => $.get(splineProps),
																	{
																		get class() {
																			return $.get($0);
																		}
																	}
																));
															});
														}

														$.append($$anchor, fragment_5);
													};

													var alternate = ($$anchor) => {
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														{
															let $0 = $.derived(() => cls('lc-grid-x-rule', classes().line, $.get(splineProps)?.class));

															$.component(node_6, () => $$props.Rule, ($$anchor, Rule_1) => {
																Rule_1($$anchor, $.spread_props(
																	{
																		get x() {
																			return tick;
																		},

																		get xOffset() {
																			return c.xBandOffset;
																		},

																		get stroke() {
																			return $$props.stroke;
																		},

																		get motion() {
																			return $$props.motion;
																		}
																	},
																	() => $.get(splineProps),
																	{
																		get class() {
																			return $.get($0);
																		}
																	}
																));
															});
														}

														$.append($$anchor, fragment_6);
													};

													$.if(node_4, ($$render) => {
														if (c.ctx.radial) $$render(consequent); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_4);
											});

											var node_7 = $.sibling(node_3, 2);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_7 = $.comment();
													var node_8 = $.first_child(fragment_7);

													{
														let $0 = $.derived(() => c.ctx.xScale.step() + c.xBandOffset);
														let $1 = $.derived(() => cls('lc-grid-x-end-rule', classes().line, $.get(splineProps)?.class));

														$.component(node_8, () => $$props.Rule, ($$anchor, Rule_2) => {
															Rule_2($$anchor, $.spread_props(
																{
																	get x() {
																		return c.xTickVals[c.xTickVals.length - 1];
																	},

																	get xOffset() {
																		return $.get($0);
																	},

																	get stroke() {
																		return $$props.stroke;
																	},

																	get motion() {
																		return $$props.motion;
																	}
																},
																() => $.get(splineProps),
																{
																	get class() {
																		return $.get($1);
																	}
																}
															));
														});
													}

													$.append($$anchor, fragment_7);
												};

												var d = $.derived(() => isScaleBand(c.ctx.xScale) && bandAlign() === 'between' && !c.ctx.radial && c.xTickVals.length);

												$.if(node_7, ($$render) => {
													if ($.get(d)) $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_1, ($$render) => {
								if (x()) $$render(consequent_2);
							});
						}

						var node_9 = $.sibling(node_1, 2);

						{
							var consequent_7 = ($$anchor) => {
								const splineProps = $.derived(() => extractLayerProps(y(), 'lc-grid-y-line'));
								var fragment_8 = $.comment();
								var node_10 = $.first_child(fragment_8);

								$.component(node_10, () => $$props.Group, ($$anchor, Group_3) => {
									Group_3($$anchor, {
										get transitionIn() {
											return $.get(transitionIn);
										},

										get transitionInParams() {
											return $.get(transitionInParams);
										},
										class: 'lc-grid-y',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root();
											var node_11 = $.first_child(fragment_9);

											$.each(node_11, 16, () => c.yTickVals, (tick) => tick, ($$anchor, tick) => {
												var fragment_10 = $.comment();
												var node_12 = $.first_child(fragment_10);

												{
													var consequent_4 = ($$anchor) => {
														var fragment_11 = $.comment();
														var node_13 = $.first_child(fragment_11);

														{
															var consequent_3 = ($$anchor) => {
																var fragment_12 = $.comment();
																var node_14 = $.first_child(fragment_12);

																{
																	let $0 = $.derived(() => c.ctx.yScale(tick) + c.yBandOffset);
																	let $1 = $.derived(() => cls('lc-grid-y-radial-circle', classes().line, $.get(splineProps)?.class));

																	$.component(node_14, () => $$props.Circle, ($$anchor, Circle_1) => {
																		Circle_1($$anchor, $.spread_props(
																			{
																				get r() {
																					return $.get($0);
																				},

																				get stroke() {
																					return $$props.stroke;
																				},

																				get motion() {
																					return $$props.motion;
																				}
																			},
																			() => $.get(splineProps),
																			{
																				get class() {
																					return $.get($1);
																				}
																			}
																		));
																	});
																}

																$.append($$anchor, fragment_12);
															};

															var alternate_1 = ($$anchor) => {
																var fragment_13 = $.comment();
																var node_15 = $.first_child(fragment_13);

																$.await(node_15, () => import('../Spline/Spline.svelte'), null, ($$anchor, $$source) => {
																	var $$value = $.derived(() => {
																		var { default: Spline } = $.get($$source);

																		return { Spline };
																	});

																	var Spline = $.derived(() => $.get($$value).Spline);
																	var fragment_14 = $.comment();
																	var node_16 = $.first_child(fragment_14);

																	{
																		let $0 = $.derived(() => c.xTickVals.map((tx) => ({ x: tx, y: tick })));
																		let $1 = $.derived(() => cls('lc-grid-y-radial-line', classes().line, $.get(splineProps)?.class));

																		$.component(node_16, () => $.get(Spline), ($$anchor, Spline_1) => {
																			Spline_1($$anchor, $.spread_props(
																				{
																					get data() {
																						return $.get($0);
																					},
																					x: 'x',
																					y: 'y',
																					get stroke() {
																						return $$props.stroke;
																					},

																					get motion() {
																						return c.tweenConfig;
																					},

																					get curve() {
																						return curveLinearClosed;
																					}
																				},
																				() => $.get(splineProps),
																				{
																					get class() {
																						return $.get($1);
																					}
																				}
																			));
																		});
																	}

																	$.append($$anchor, fragment_14);
																});

																$.append($$anchor, fragment_13);
															};

															$.if(node_13, ($$render) => {
																if (radialY() === 'circle') $$render(consequent_3); else $$render(alternate_1, -1);
															});
														}

														$.append($$anchor, fragment_11);
													};

													var alternate_2 = ($$anchor) => {
														var fragment_15 = $.comment();
														var node_17 = $.first_child(fragment_15);

														{
															let $0 = $.derived(() => c.ctx.yScale(tick) + c.yBandOffset);
															let $1 = $.derived(() => c.ctx.yScale(tick) + c.yBandOffset);
															let $2 = $.derived(() => cls('lc-grid-y-rule', classes().line, $.get(splineProps)?.class));

															$.component(node_17, () => $$props.Line, ($$anchor, Line_2) => {
																Line_2($$anchor, $.spread_props(
																	{
																		get x1() {
																			return c.ctx.xRange[0];
																		},

																		get y1() {
																			return $.get($0);
																		},

																		get x2() {
																			return c.ctx.xRange[1];
																		},

																		get y2() {
																			return $.get($1);
																		},

																		get stroke() {
																			return $$props.stroke;
																		},

																		get motion() {
																			return $$props.motion;
																		}
																	},
																	() => $.get(splineProps),
																	{
																		get class() {
																			return $.get($2);
																		}
																	}
																));
															});
														}

														$.append($$anchor, fragment_15);
													};

													$.if(node_12, ($$render) => {
														if (c.ctx.radial) $$render(consequent_4); else $$render(alternate_2, -1);
													});
												}

												$.append($$anchor, fragment_10);
											});

											var node_18 = $.sibling(node_11, 2);

											{
												var consequent_6 = ($$anchor) => {
													var fragment_16 = $.comment();
													var node_19 = $.first_child(fragment_16);

													{
														var consequent_5 = ($$anchor) => {
															var fragment_17 = $.comment();
															var node_20 = $.first_child(fragment_17);

															{
																let $0 = $.derived(() => c.ctx.yScale(c.yTickVals[c.yTickVals.length - 1]) + c.ctx.yScale.step() + c.yBandOffset);
																let $1 = $.derived(() => cls('lc-grid-y-radial-circle', classes().line, $.get(splineProps)?.class));

																$.component(node_20, () => $$props.Circle, ($$anchor, Circle_2) => {
																	Circle_2($$anchor, $.spread_props(
																		{
																			get r() {
																				return $.get($0);
																			},

																			get stroke() {
																				return $$props.stroke;
																			},

																			get motion() {
																				return $$props.motion;
																			}
																		},
																		() => $.get(splineProps),
																		{
																			get class() {
																				return $.get($1);
																			}
																		}
																	));
																});
															}

															$.append($$anchor, fragment_17);
														};

														var alternate_3 = ($$anchor) => {
															const yEnd = $.derived(() => c.ctx.yScale(c.yTickVals[c.yTickVals.length - 1]) + c.ctx.yScale.step() + c.yBandOffset);
															var fragment_18 = $.comment();
															var node_21 = $.first_child(fragment_18);

															{
																let $0 = $.derived(() => cls('lc-grid-y-end-rule', classes().line, $.get(splineProps)?.class));

																$.component(node_21, () => $$props.Line, ($$anchor, Line_3) => {
																	Line_3($$anchor, $.spread_props(
																		{
																			get x1() {
																				return c.ctx.xRange[0];
																			},

																			get y1() {
																				return $.get(yEnd);
																			},

																			get x2() {
																				return c.ctx.xRange[1];
																			},

																			get y2() {
																				return $.get(yEnd);
																			},

																			get stroke() {
																				return $$props.stroke;
																			},

																			get motion() {
																				return $$props.motion;
																			}
																		},
																		() => $.get(splineProps),
																		{
																			get class() {
																				return $.get($0);
																			}
																		}
																	));
																});
															}

															$.append($$anchor, fragment_18);
														};

														$.if(node_19, ($$render) => {
															if (c.ctx.radial) $$render(consequent_5); else $$render(alternate_3, -1);
														});
													}

													$.append($$anchor, fragment_16);
												};

												var d_1 = $.derived(() => isScaleBand(c.ctx.yScale) && bandAlign() === 'between' && c.yTickVals.length);

												$.if(node_18, ($$render) => {
													if ($.get(d_1)) $$render(consequent_6);
												});
											}

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							};

							$.if(node_9, ($$render) => {
								if (y()) $$render(consequent_7);
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}