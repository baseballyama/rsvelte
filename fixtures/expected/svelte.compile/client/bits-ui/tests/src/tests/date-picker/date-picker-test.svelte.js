import 'svelte/internal/disclose-version';
import { DatePicker } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'placeholder',
	'value',
	'open'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<main><div data-testid="value"> </div> <div data-testid="open"> </div> <button data-testid="clear">clear</button> <button data-testid="toggle-open">toggle open</button> <!></main>`);

export default function Date_picker_test($$anchor, $$props) {
	let placeholder = $.prop($$props, 'placeholder', 7),
		value = $.prop($$props, 'value', 7),
		open = $.prop($$props, 'open', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	function clear() {
		value(undefined);
	}

	var main = root_4();
	var div = $.child(main);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var button = $.sibling(div_1, 2);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	$.component(node, () => DatePicker.Root, ($$anchor, DatePicker_Root) => {
		DatePicker_Root($$anchor, $.spread_props(() => restProps, {
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

				$.component(node_1, () => DatePicker.Label, ($$anchor, DatePicker_Label) => {
					DatePicker_Label($$anchor, {
						'data-testid': 'label',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Date');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let segments = () => ($$arg0?.()).segments;
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.each(node_3, 17, segments, $.index, ($$anchor, $$item, i, $$array) => {
							let part = () => $.get($$item).part;
							let value = () => $.get($$item).value;
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => part() === "literal" ? undefined : part());

								$.component(node_4, () => DatePicker.Segment, ($$anchor, DatePicker_Segment) => {
									DatePicker_Segment($$anchor, {
										get part() {
											return part();
										},

										get 'data-testid'() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, value()));
											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_2, () => DatePicker.Input, ($$anchor, DatePicker_Input) => {
						DatePicker_Input($$anchor, { 'data-testid': 'input', children, $$slots: { default: true } });
					});
				}

				var node_5 = $.sibling(node_2, 2);

				$.component(node_5, () => DatePicker.Trigger, ($$anchor, DatePicker_Trigger) => {
					DatePicker_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Open');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => DatePicker.Content, ($$anchor, DatePicker_Content) => {
					DatePicker_Content($$anchor, {
						'data-testid': 'content',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_7 = $.first_child(fragment_4);

							{
								const children = ($$anchor, $$arg0) => {
									let months = () => ($$arg0?.()).months;
									let weekdays = () => ($$arg0?.()).weekdays;
									var fragment_5 = root_2();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => DatePicker.Header, ($$anchor, DatePicker_Header) => {
										DatePicker_Header($$anchor, {
											'data-testid': 'header',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_9 = $.first_child(fragment_6);

												$.component(node_9, () => DatePicker.PrevButton, ($$anchor, DatePicker_PrevButton) => {
													DatePicker_PrevButton($$anchor, {
														'data-testid': 'prev-button',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Prev');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => DatePicker.Heading, ($$anchor, DatePicker_Heading) => {
													DatePicker_Heading($$anchor, { 'data-testid': 'heading' });
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => DatePicker.NextButton, ($$anchor, DatePicker_NextButton) => {
													DatePicker_NextButton($$anchor, {
														'data-testid': 'next-button',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Next');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var div_2 = $.sibling(node_8, 2);

									$.each(div_2, 21, months, $.index, ($$anchor, month) => {
										const m = $.derived(() => $.get(month).value.month);
										var fragment_7 = $.comment();
										var node_12 = $.first_child(fragment_7);

										$.component(node_12, () => DatePicker.Grid, ($$anchor, DatePicker_Grid) => {
											DatePicker_Grid($$anchor, {
												get 'data-testid'() {
													return `grid-${$.get(m) ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_1();
													var node_13 = $.first_child(fragment_8);

													$.component(node_13, () => DatePicker.GridHead, ($$anchor, DatePicker_GridHead) => {
														DatePicker_GridHead($$anchor, {
															get 'data-testid'() {
																return `grid-head-${$.get(m) ?? ''}`;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_14 = $.first_child(fragment_9);

																$.component(node_14, () => DatePicker.GridRow, ($$anchor, DatePicker_GridRow) => {
																	DatePicker_GridRow($$anchor, {
																		get 'data-testid'() {
																			return `grid-row-${$.get(m) ?? ''}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = $.comment();
																			var node_15 = $.first_child(fragment_10);

																			$.each(node_15, 17, weekdays, $.index, ($$anchor, day, i, $$array_1) => {
																				var fragment_11 = $.comment();
																				var node_16 = $.first_child(fragment_11);

																				$.component(node_16, () => DatePicker.HeadCell, ($$anchor, DatePicker_HeadCell) => {
																					DatePicker_HeadCell($$anchor, {
																						get 'data-testid'() {
																							return `weekday-${$.get(m) ?? ''}-${i}`;
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_7 = $.text();

																							$.template_effect(() => $.set_text(text_7, $.get(day)));
																							$.append($$anchor, text_7);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_11);
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													var node_17 = $.sibling(node_13, 2);

													$.component(node_17, () => DatePicker.GridBody, ($$anchor, DatePicker_GridBody) => {
														DatePicker_GridBody($$anchor, {
															get 'data-testid'() {
																return `grid-body-${$.get(m) ?? ''}`;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_13 = $.comment();
																var node_18 = $.first_child(fragment_13);

																$.each(node_18, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates, i, $$array_2) => {
																	var fragment_14 = $.comment();
																	var node_19 = $.first_child(fragment_14);

																	$.component(node_19, () => DatePicker.GridRow, ($$anchor, DatePicker_GridRow_1) => {
																		DatePicker_GridRow_1($$anchor, {
																			get 'data-testid'() {
																				return `grid-row-${$.get(m) ?? ''}-${i}`;
																			},
																			'data-week': true,
																			children: ($$anchor, $$slotProps) => {
																				var fragment_15 = $.comment();
																				var node_20 = $.first_child(fragment_15);

																				$.each(node_20, 17, () => $.get(weekDates), $.index, ($$anchor, date, d) => {
																					var fragment_16 = $.comment();
																					var node_21 = $.first_child(fragment_16);

																					$.component(node_21, () => DatePicker.Cell, ($$anchor, DatePicker_Cell) => {
																						DatePicker_Cell($$anchor, {
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
																								var fragment_17 = $.comment();
																								var node_22 = $.first_child(fragment_17);

																								$.component(node_22, () => DatePicker.Day, ($$anchor, DatePicker_Day) => {
																									DatePicker_Day($$anchor, {
																										get 'data-testid'() {
																											return `date-${$.get(date).month ?? ''}-${$.get(date).day ?? ''}`;
																										},
																										class: 'p-1',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_8 = $.text();

																											$.template_effect(() => $.set_text(text_8, $.get(date).day));
																											$.append($$anchor, text_8);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_17);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_16);
																				});

																				$.append($$anchor, fragment_15);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_14);
																});

																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									});

									$.reset(div_2);
									$.append($$anchor, fragment_5);
								};

								$.component(node_7, () => DatePicker.Calendar, ($$anchor, DatePicker_Calendar) => {
									DatePicker_Calendar($$anchor, {
										'data-testid': 'calendar',
										children,
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_4);
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
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, open());
		},
		[() => String(value())]
	);

	$.delegated('click', button, clear);
	$.delegated('click', button_1, () => open(!open()));
	$.append($$anchor, main);
}

$.delegate(['click']);