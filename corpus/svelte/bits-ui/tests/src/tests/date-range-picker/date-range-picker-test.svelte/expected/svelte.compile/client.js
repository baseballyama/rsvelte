import 'svelte/internal/disclose-version';
import { DateRangePicker } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'placeholder',
	'value',
	'open',
	'startProps',
	'endProps'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<main><div data-testid="value"> </div> <div data-testid="open"> </div> <div data-testid="start-value"> </div> <div data-testid="end-value"> </div> <button>clear</button> <button>toggle open</button> <!></main>`);

export default function Date_range_picker_test($$anchor, $$props) {
	$.push($$props, true);

	let placeholder = $.prop($$props, 'placeholder', 7),
		value = $.prop($$props, 'value', 7),
		open = $.prop($$props, 'open', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	function clear() {
		value({ start: undefined, end: undefined });
	}

	var main = root_4();
	var div = $.child(main);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var text_3 = $.only_child(div_3, true);
	var button = $.sibling(div_3, 2);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	$.component(node, () => DateRangePicker.Root, ($$anchor, DateRangePicker_Root) => {
		DateRangePicker_Root($$anchor, $.spread_props(() => restProps, {
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			get placeholder() {
				return placeholder();
			},

			set placeholder($$value) {
				placeholder($$value);
			},

			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => DateRangePicker.Label, ($$anchor, DateRangePicker_Label) => {
					DateRangePicker_Label($$anchor, {
						'data-testid': 'label',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Rental Days');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.each(node_2, 16, () => ["start", "end"], (type) => type, ($$anchor, type) => {
					const inputProps = $.derived(() => type === "start" ? $$props.startProps : $$props.endProps);
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					{
						const children = ($$anchor, $$arg0) => {
							let segments = () => ($$arg0?.()).segments;
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.each(node_4, 17, segments, $.index, ($$anchor, $$item, i, $$array) => {
								let part = () => $.get($$item).part;
								let value = () => $.get($$item).value;
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => part() === "literal" ? undefined : `${type}-${part()}`);

									$.component(node_5, () => DateRangePicker.Segment, ($$anchor, DateRangePicker_Segment) => {
										DateRangePicker_Segment($$anchor, {
											get part() {
												return part();
											},

											get 'data-testid'() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text();

												$.template_effect(() => $.set_text(text_5, value()));
												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						};

						$.component(node_3, () => DateRangePicker.Input, ($$anchor, DateRangePicker_Input) => {
							DateRangePicker_Input($$anchor, $.spread_props(
								{
									get type() {
										return type;
									},

									get 'data-testid'() {
										return `${type ?? ''}-input`;
									}
								},
								() => $.get(inputProps),
								{ children, $$slots: { default: true } }
							));
						});
					}

					$.append($$anchor, fragment_1);
				});

				var node_6 = $.sibling(node_2, 2);

				$.component(node_6, () => DateRangePicker.Trigger, ($$anchor, DateRangePicker_Trigger) => {
					DateRangePicker_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Open');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => DateRangePicker.Content, ($$anchor, DateRangePicker_Content) => {
					DateRangePicker_Content($$anchor, {
						'data-testid': 'content',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_8 = $.first_child(fragment_5);

							{
								const children = ($$anchor, $$arg0) => {
									let months = () => ($$arg0?.()).months;
									let weekdays = () => ($$arg0?.()).weekdays;
									var fragment_6 = root_2();
									var node_9 = $.first_child(fragment_6);

									$.component(node_9, () => DateRangePicker.Header, ($$anchor, DateRangePicker_Header) => {
										DateRangePicker_Header($$anchor, {
											'data-testid': 'header',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_10 = $.first_child(fragment_7);

												$.component(node_10, () => DateRangePicker.PrevButton, ($$anchor, DateRangePicker_PrevButton) => {
													DateRangePicker_PrevButton($$anchor, {
														'data-testid': 'prev-button',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Prev');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => DateRangePicker.Heading, ($$anchor, DateRangePicker_Heading) => {
													DateRangePicker_Heading($$anchor, { 'data-testid': 'heading' });
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => DateRangePicker.NextButton, ($$anchor, DateRangePicker_NextButton) => {
													DateRangePicker_NextButton($$anchor, {
														'data-testid': 'next-button',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Next');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var div_4 = $.sibling(node_9, 2);

									$.each(div_4, 21, months, $.index, ($$anchor, month) => {
										const m = $.derived(() => $.get(month).value.month);
										var fragment_8 = $.comment();
										var node_13 = $.first_child(fragment_8);

										$.component(node_13, () => DateRangePicker.Grid, ($$anchor, DateRangePicker_Grid) => {
											DateRangePicker_Grid($$anchor, {
												get 'data-testid'() {
													return `grid-${$.get(m) ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_1();
													var node_14 = $.first_child(fragment_9);

													$.component(node_14, () => DateRangePicker.GridHead, ($$anchor, DateRangePicker_GridHead) => {
														DateRangePicker_GridHead($$anchor, {
															get 'data-testid'() {
																return `grid-head-${$.get(m) ?? ''}`;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_10 = $.comment();
																var node_15 = $.first_child(fragment_10);

																$.component(node_15, () => DateRangePicker.GridRow, ($$anchor, DateRangePicker_GridRow) => {
																	DateRangePicker_GridRow($$anchor, {
																		get 'data-testid'() {
																			return `grid-row-${$.get(m) ?? ''}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_11 = $.comment();
																			var node_16 = $.first_child(fragment_11);

																			$.each(node_16, 17, weekdays, $.index, ($$anchor, day, i, $$array_1) => {
																				var fragment_12 = $.comment();
																				var node_17 = $.first_child(fragment_12);

																				$.component(node_17, () => DateRangePicker.HeadCell, ($$anchor, DateRangePicker_HeadCell) => {
																					DateRangePicker_HeadCell($$anchor, {
																						get 'data-testid'() {
																							return `weekday-${$.get(m) ?? ''}-${i}`;
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_9 = $.text();

																							$.template_effect(() => $.set_text(text_9, $.get(day)));
																							$.append($$anchor, text_9);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_12);
																			});

																			$.append($$anchor, fragment_11);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_14, 2);

													$.component(node_18, () => DateRangePicker.GridBody, ($$anchor, DateRangePicker_GridBody) => {
														DateRangePicker_GridBody($$anchor, {
															get 'data-testid'() {
																return `grid-body-${$.get(m) ?? ''}`;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_19 = $.first_child(fragment_14);

																$.each(node_19, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates, i, $$array_2) => {
																	var fragment_15 = $.comment();
																	var node_20 = $.first_child(fragment_15);

																	$.component(node_20, () => DateRangePicker.GridRow, ($$anchor, DateRangePicker_GridRow_1) => {
																		DateRangePicker_GridRow_1($$anchor, {
																			get 'data-testid'() {
																				return `grid-row-${$.get(m) ?? ''}-${i}`;
																			},
																			'data-week': true,
																			children: ($$anchor, $$slotProps) => {
																				var fragment_16 = $.comment();
																				var node_21 = $.first_child(fragment_16);

																				$.each(node_21, 17, () => $.get(weekDates), $.index, ($$anchor, date, d) => {
																					var fragment_17 = $.comment();
																					var node_22 = $.first_child(fragment_17);

																					$.component(node_22, () => DateRangePicker.Cell, ($$anchor, DateRangePicker_Cell) => {
																						DateRangePicker_Cell($$anchor, {
																							get date() {
																								return $.get(date);
																							},

																							get month() {
																								return $.get(month).value;
																							},

																							get 'data-testid'() {
																								return `cell-${$.get(date).month ?? ''}-${d}`;
																							},
																							class: 'p-3',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_18 = $.comment();
																								var node_23 = $.first_child(fragment_18);

																								$.component(node_23, () => DateRangePicker.Day, ($$anchor, DateRangePicker_Day) => {
																									DateRangePicker_Day($$anchor, {
																										get 'data-testid'() {
																											return `date-${$.get(date).month ?? ''}-${$.get(date).day ?? ''}`;
																										},
																										class: 'p-1',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_10 = $.text();

																											$.template_effect(() => $.set_text(text_10, $.get(date).day));
																											$.append($$anchor, text_10);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_18);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_17);
																				});

																				$.append($$anchor, fragment_16);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_15);
																});

																$.append($$anchor, fragment_14);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									});

									$.reset(div_4);
									$.append($$anchor, fragment_6);
								};

								$.component(node_8, () => DateRangePicker.Calendar, ($$anchor, DateRangePicker_Calendar) => {
									DateRangePicker_Calendar($$anchor, {
										'data-testid': 'calendar',
										children,
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(main);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, value());
			$.set_text(text_1, open());
			$.set_text(text_2, $0);
			$.set_text(text_3, $1);
		},
		[() => String(value()?.start), () => String(value()?.end)]
	);

	$.delegated('click', button, clear);
	$.delegated('click', button_1, () => open(!open()));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);