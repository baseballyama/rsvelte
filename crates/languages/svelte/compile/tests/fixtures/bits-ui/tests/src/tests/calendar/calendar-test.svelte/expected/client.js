import 'svelte/internal/disclose-version';
import { CalendarDateTime, ZonedDateTime } from "@internationalized/date";
import { Calendar } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'placeholder',
	'value',
	'type'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div></div>`, 1);
var root_3 = $.from_html(`<main><div data-testid="value"> </div> <!> <button data-testid="add-day">Add Day</button> <button data-testid="add-month">Add Month</button> <button data-testid="add-year">Add Year</button> <button data-testid="set-time">Set time</button></main>`);

export default function Calendar_test($$anchor, $$props) {
	$.push($$props, true);

	let placeholder = $.prop($$props, 'placeholder', 7),
		value = $.prop($$props, 'value', 7),
		_type = $.prop($$props, 'type', 3, "single"),
		restProps = $.rest_props($$props, rest_excludes);

	function changeValue(field) {
		if (value()) {
			value(value().cycle(field, 1));
		} else if (placeholder()) {
			placeholder(placeholder().cycle(field, 1));
		}
	}

	var main = root_3();
	var div = $.child(main);
	var text = $.only_child(div, true);
	var node = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let months = () => ($$arg0?.()).months;
			let weekdays = () => ($$arg0?.()).weekdays;
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Calendar.Header, ($$anchor, Calendar_Header) => {
				Calendar_Header($$anchor, {
					'data-testid': 'header',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Calendar.PrevButton, ($$anchor, Calendar_PrevButton) => {
							Calendar_PrevButton($$anchor, {
								'data-testid': 'prev-button',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Prev');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Calendar.Heading, ($$anchor, Calendar_Heading) => {
							Calendar_Heading($$anchor, { 'data-testid': 'heading' });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Calendar.NextButton, ($$anchor, Calendar_NextButton) => {
							Calendar_NextButton($$anchor, {
								'data-testid': 'next-button',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Next');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var div_1 = $.sibling(node_1, 2);

			$.each(div_1, 21, months, $.index, ($$anchor, month) => {
				const m = $.derived(() => $.get(month).value.month);
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => Calendar.Grid, ($$anchor, Calendar_Grid) => {
					Calendar_Grid($$anchor, {
						get 'data-testid'() {
							return `grid-${$.get(m) ?? ''}`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_6 = $.first_child(fragment_3);

							$.component(node_6, () => Calendar.GridHead, ($$anchor, Calendar_GridHead) => {
								Calendar_GridHead($$anchor, {
									get 'data-testid'() {
										return `grid-head-${$.get(m) ?? ''}`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_7 = $.first_child(fragment_4);

										$.component(node_7, () => Calendar.GridRow, ($$anchor, Calendar_GridRow) => {
											Calendar_GridRow($$anchor, {
												get 'data-testid'() {
													return `grid-row-${$.get(m) ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_8 = $.first_child(fragment_5);

													$.each(node_8, 19, weekdays, (day, i) => day + i, ($$anchor, day, i, $$array) => {
														var fragment_6 = $.comment();
														var node_9 = $.first_child(fragment_6);

														$.component(node_9, () => Calendar.HeadCell, ($$anchor, Calendar_HeadCell) => {
															Calendar_HeadCell($$anchor, {
																get 'data-testid'() {
																	return `weekday-${$.get(m) ?? ''}-${$.get(i) ?? ''}`;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text();

																	$.template_effect(() => $.set_text(text_3, $.get(day)));
																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_6, 2);

							$.component(node_10, () => Calendar.GridBody, ($$anchor, Calendar_GridBody) => {
								Calendar_GridBody($$anchor, {
									get 'data-testid'() {
										return `grid-body-${$.get(m) ?? ''}`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_11 = $.first_child(fragment_8);

										$.each(node_11, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates, i, $$array_1) => {
											var fragment_9 = $.comment();
											var node_12 = $.first_child(fragment_9);

											$.component(node_12, () => Calendar.GridRow, ($$anchor, Calendar_GridRow_1) => {
												Calendar_GridRow_1($$anchor, {
													get 'data-testid'() {
														return `grid-row-${$.get(m) ?? ''}-${i}`;
													},
													'data-week': true,
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = $.comment();
														var node_13 = $.first_child(fragment_10);

														$.each(node_13, 17, () => $.get(weekDates), $.index, ($$anchor, date, d) => {
															var fragment_11 = $.comment();
															var node_14 = $.first_child(fragment_11);

															$.component(node_14, () => Calendar.Cell, ($$anchor, Calendar_Cell) => {
																Calendar_Cell($$anchor, {
																	get date() {
																		return $.get(date);
																	},

																	get month() {
																		return $.get(month).value;
																	},

																	get 'data-testid'() {
																		return `cell-${$.get(date).month ?? ''}-${d}`;
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = $.comment();
																		var node_15 = $.first_child(fragment_12);

																		$.component(node_15, () => Calendar.Day, ($$anchor, Calendar_Day) => {
																			Calendar_Day($$anchor, {
																				get 'data-testid'() {
																					return `date-${$.get(date).month ?? ''}-${$.get(date).day ?? ''}`;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text();

																					$.template_effect(() => $.set_text(text_4, $.get(date).day));
																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_12);
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
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.reset(div_1);
			$.append($$anchor, fragment);
		};

		$.component(node, () => Calendar.Root, ($$anchor, Calendar_Root) => {
			Calendar_Root($$anchor, $.spread_props({ type: 'single' }, () => restProps, {
				'data-testid': 'calendar',
				get placeholder() {
					return placeholder();
				},

				set placeholder($$value) {
					placeholder($$value);
				},

				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},
				children,
				$$slots: { default: true }
			}));
		});
	}

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(main);
	$.template_effect(($0) => $.set_text(text, $0), [() => String(value()?.toString())]);
	$.delegated('click', button, () => changeValue("day"));
	$.delegated('click', button_1, () => changeValue("month"));
	$.delegated('click', button_2, () => changeValue("year"));

	$.delegated('click', button_3, () => {
		if (value() instanceof CalendarDateTime || value() instanceof ZonedDateTime) {
			value(value().set({ hour: 15, minute: 15, second: 15, millisecond: 15 }));
		}
	});

	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);