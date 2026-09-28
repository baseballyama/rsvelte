import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { AxisState } from './Axis.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Line',
	'Text',
	'Rule',
	'placement',
	'label',
	'labelPlacement',
	'labelProps',
	'rule',
	'grid',
	'ticks',
	'tickSpacing',
	'tickMultiline',
	'tickLength',
	'tickMarks',
	'format',
	'tickLabelProps',
	'stroke',
	'fill',
	'motion',
	'transitionIn',
	'transitionInParams',
	'scale',
	'classes',
	'class',
	'tickLabel',
	'facetAll'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Axis_base($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, ''),
		labelPlacement = $.prop($$props, 'labelPlacement', 3, 'middle'),
		rule = $.prop($$props, 'rule', 3, false),
		grid = $.prop($$props, 'grid', 3, false),
		tickMultiline = $.prop($$props, 'tickMultiline', 3, false),
		tickLength = $.prop($$props, 'tickLength', 3, 4),
		tickMarks = $.prop($$props, 'tickMarks', 3, true),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new AxisState(() => ({
		placement: $$props.placement,
		label: label(),
		labelPlacement: labelPlacement(),
		labelProps: $$props.labelProps,
		rule: rule(),
		grid: grid(),
		ticks: $$props.ticks,
		tickSpacing: $$props.tickSpacing,
		tickMultiline: tickMultiline(),
		tickLength: tickLength(),
		tickMarks: tickMarks(),
		format: $$props.format,
		tickLabelProps: $$props.tickLabelProps,
		stroke: $$props.stroke,
		fill: $$props.fill,
		motion: $$props.motion,
		scale: $$props.scale,
		classes: classes(),
		facetAll: $$props.facetAll
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_9 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cls('lc-axis', `placement-${$$props.placement}`, classes().root, $$props.class));

				$.component(node_1, () => $$props.Group, ($$anchor, Group_1) => {
					Group_1($$anchor, $.spread_props(() => restProps, {
						get 'data-placement'() {
							return $$props.placement;
						},

						get class() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => $$props.placement === 'left'
											? '$left'
											: $$props.placement === 'right' ? '$right' : $$props.placement === 'angle');

										let $1 = $.derived(() => $$props.placement === 'top'
											? '$top'
											: $$props.placement === 'bottom' ? '$bottom' : $$props.placement === 'radius');

										let $2 = $.derived(() => extractLayerProps(rule(), 'lc-axis-rule', classes().rule ?? ''));

										$.component(node_3, () => $$props.Rule, ($$anchor, Rule_1) => {
											Rule_1($$anchor, $.spread_props(
												{
													get x() {
														return $.get($0);
													},

													get y() {
														return $.get($1);
													},

													get stroke() {
														return $$props.stroke;
													},

													get motion() {
														return $$props.motion;
													}
												},
												() => $.get($2)
											));
										});
									}

									$.append($$anchor, fragment_3);
								};

								$.if(node_2, ($$render) => {
									if (rule() !== false) $$render(consequent);
								});
							}

							var node_4 = $.sibling(node_2, 2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.snippet(node_5, label, () => ({ props: c.resolvedLabelProps }));
									$.append($$anchor, fragment_4);
								};

								var consequent_2 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_6 = $.first_child(fragment_5);

									$.component(node_6, () => $$props.Text, ($$anchor, Text_1) => {
										Text_1($$anchor, $.spread_props(() => c.resolvedLabelProps));
									});

									$.append($$anchor, fragment_5);
								};

								$.if(node_4, ($$render) => {
									if (typeof label() === 'function') $$render(consequent_1); else if (label()) $$render(consequent_2, 1);
								});
							}

							var node_7 = $.sibling(node_4, 2);

							$.each(node_7, 19, () => c.tickItems, (item) => item.key, ($$anchor, item, index) => {
								var fragment_6 = $.comment();
								var node_8 = $.first_child(fragment_6);

								$.component(node_8, () => $$props.Group, ($$anchor, Group_2) => {
									Group_2($$anchor, {
										get transitionIn() {
											return $$props.transitionIn;
										},

										get transitionInParams() {
											return $$props.transitionInParams;
										},
										class: 'lc-axis-tick-group',
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_9 = $.first_child(fragment_7);

											{
												var consequent_3 = ($$anchor) => {
													var fragment_8 = $.comment();
													var node_10 = $.first_child(fragment_8);

													{
														let $0 = $.derived(() => c.orientation === 'horizontal' || c.orientation === 'angle' ? $.get(item).tick : false);
														let $1 = $.derived(() => c.orientation === 'vertical' || c.orientation === 'radius' ? $.get(item).tick : false);
														let $2 = $.derived(() => extractLayerProps(grid(), 'lc-axis-grid', classes().rule ?? ''));

														$.component(node_10, () => $$props.Rule, ($$anchor, Rule_2) => {
															Rule_2($$anchor, $.spread_props(
																{
																	get x() {
																		return $.get($0);
																	},

																	get y() {
																		return $.get($1);
																	},

																	get stroke() {
																		return $$props.stroke;
																	},

																	get motion() {
																		return $$props.motion;
																	}
																},
																() => $.get($2)
															));
														});
													}

													$.append($$anchor, fragment_8);
												};

												$.if(node_9, ($$render) => {
													if (grid() !== false) $$render(consequent_3);
												});
											}

											var node_11 = $.sibling(node_9, 2);

											{
												var consequent_7 = ($$anchor) => {
													const tickClasses = $.derived(() => cls('lc-axis-tick', classes().tick));
													var fragment_9 = $.comment();
													var node_12 = $.first_child(fragment_9);

													{
														var consequent_4 = ($$anchor) => {
															var fragment_10 = $.comment();
															var node_13 = $.first_child(fragment_10);

															{
																let $0 = $.derived(() => $.get(item).tickCoordsY + ($$props.placement === 'top' ? -tickLength() : tickLength()));

																$.component(node_13, () => $$props.Line, ($$anchor, Line_1) => {
																	Line_1($$anchor, {
																		get x1() {
																			return $.get(item).tickCoordsX;
																		},

																		get y1() {
																			return $.get(item).tickCoordsY;
																		},

																		get x2() {
																			return $.get(item).tickCoordsX;
																		},

																		get y2() {
																			return $.get($0);
																		},

																		get stroke() {
																			return $$props.stroke;
																		},

																		get motion() {
																			return $$props.motion;
																		},

																		get class() {
																			return $.get(tickClasses);
																		}
																	});
																});
															}

															$.append($$anchor, fragment_10);
														};

														var consequent_5 = ($$anchor) => {
															var fragment_11 = $.comment();
															var node_14 = $.first_child(fragment_11);

															{
																let $0 = $.derived(() => $.get(item).tickCoordsX + ($$props.placement === 'left' ? -tickLength() : tickLength()));

																$.component(node_14, () => $$props.Line, ($$anchor, Line_2) => {
																	Line_2($$anchor, {
																		get x1() {
																			return $.get(item).tickCoordsX;
																		},

																		get y1() {
																			return $.get(item).tickCoordsY;
																		},

																		get x2() {
																			return $.get($0);
																		},

																		get y2() {
																			return $.get(item).tickCoordsY;
																		},

																		get stroke() {
																			return $$props.stroke;
																		},

																		get motion() {
																			return $$props.motion;
																		},

																		get class() {
																			return $.get(tickClasses);
																		}
																	});
																});
															}

															$.append($$anchor, fragment_11);
														};

														var consequent_6 = ($$anchor) => {
															var fragment_12 = $.comment();
															var node_15 = $.first_child(fragment_12);

															$.component(node_15, () => $$props.Line, ($$anchor, Line_3) => {
																Line_3($$anchor, {
																	get x1() {
																		return $.get(item).radialTickCoordsX;
																	},

																	get y1() {
																		return $.get(item).radialTickCoordsY;
																	},

																	get x2() {
																		return $.get(item).radialTickMarkCoordsX;
																	},

																	get y2() {
																		return $.get(item).radialTickMarkCoordsY;
																	},

																	get stroke() {
																		return $$props.stroke;
																	},

																	get motion() {
																		return $$props.motion;
																	},

																	get class() {
																		return $.get(tickClasses);
																	}
																});
															});

															$.append($$anchor, fragment_12);
														};

														$.if(node_12, ($$render) => {
															if (c.orientation === 'horizontal') $$render(consequent_4); else if (c.orientation === 'vertical') $$render(consequent_5, 1); else if (c.orientation === 'angle') $$render(consequent_6, 2);
														});
													}

													$.append($$anchor, fragment_9);
												};

												$.if(node_11, ($$render) => {
													if (tickMarks()) $$render(consequent_7);
												});
											}

											var node_16 = $.sibling(node_11, 2);

											{
												var consequent_8 = ($$anchor) => {
													var fragment_13 = $.comment();
													var node_17 = $.first_child(fragment_13);

													$.snippet(node_17, () => $$props.tickLabel, () => ({ props: $.get(item).tickLabelProps, index: $.get(index) }));
													$.append($$anchor, fragment_13);
												};

												var alternate = ($$anchor) => {
													var fragment_14 = $.comment();
													var node_18 = $.first_child(fragment_14);

													$.component(node_18, () => $$props.Text, ($$anchor, Text_2) => {
														Text_2($$anchor, $.spread_props(() => $.get(item).tickLabelProps));
													});

													$.append($$anchor, fragment_14);
												};

												$.if(node_16, ($$render) => {
													if ($$props.tickLabel) $$render(consequent_8); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}));
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (c.visible) $$render(consequent_9);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}