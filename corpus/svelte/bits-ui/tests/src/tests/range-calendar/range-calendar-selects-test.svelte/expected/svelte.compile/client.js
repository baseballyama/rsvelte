import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="header"><!> <!></div> <div data-testid="calendar-grid"></div>`, 1);

export default function Range_calendar_selects_test($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		disabled = $.prop($$props, 'disabled', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let calendarMonths = () => ($$arg0?.()).months;
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			$.component(node_1, () => RangeCalendar.MonthSelect, ($$anchor, RangeCalendar_MonthSelect) => {
				RangeCalendar_MonthSelect($$anchor, {
					'data-testid': 'month-select',
					get months() {
						return $$props.months;
					},

					get monthFormat() {
						return $$props.monthFormat;
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => RangeCalendar.YearSelect, ($$anchor, RangeCalendar_YearSelect) => {
				RangeCalendar_YearSelect($$anchor, {
					'data-testid': 'year-select',
					get years() {
						return $$props.years;
					},

					get yearFormat() {
						return $$props.yearFormat;
					}
				});
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);

			$.each(div_1, 21, calendarMonths, (month) => month.value.toString(), ($$anchor, month) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => RangeCalendar.Grid, ($$anchor, RangeCalendar_Grid) => {
					RangeCalendar_Grid($$anchor, {
						get 'data-testid'() {
							return `grid-${$.get(month).value.month ?? ''}`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => RangeCalendar.GridHead, ($$anchor, RangeCalendar_GridHead) => {
								RangeCalendar_GridHead($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow) => {
											RangeCalendar_GridRow($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => RangeCalendar.HeadCell, ($$anchor, RangeCalendar_HeadCell) => {
														RangeCalendar_HeadCell($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Day');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
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

							var node_7 = $.sibling(node_4, 2);

							$.component(node_7, () => RangeCalendar.GridBody, ($$anchor, RangeCalendar_GridBody) => {
								RangeCalendar_GridBody($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_8 = $.first_child(fragment_6);

										$.each(node_8, 17, () => $.get(month).weeks, (weekDates) => weekDates[0]?.toString(), ($$anchor, weekDates) => {
											var fragment_7 = $.comment();
											var node_9 = $.first_child(fragment_7);

											$.component(node_9, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow_1) => {
												RangeCalendar_GridRow_1($$anchor, {
													'data-week': true,
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = $.comment();
														var node_10 = $.first_child(fragment_8);

														$.each(node_10, 17, () => $.get(weekDates), (date) => date.toString(), ($$anchor, date) => {
															var fragment_9 = $.comment();
															var node_11 = $.first_child(fragment_9);

															$.component(node_11, () => RangeCalendar.Cell, ($$anchor, RangeCalendar_Cell) => {
																RangeCalendar_Cell($$anchor, {
																	get date() {
																		return $.get(date);
																	},

																	get month() {
																		return $.get(month).value;
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_12 = $.first_child(fragment_10);

																		$.component(node_12, () => RangeCalendar.Day, ($$anchor, RangeCalendar_Day) => {
																			RangeCalendar_Day($$anchor, {
																				get 'data-testid'() {
																					return `date-${$.get(date).month ?? ''}-${$.get(date).day ?? ''}`;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text();

																					$.template_effect(() => $.set_text(text_1, $.get(date).day));
																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
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

											$.append($$anchor, fragment_7);
										});

										$.append($$anchor, fragment_6);
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
			$.append($$anchor, fragment_1);
		};

		$.component(node, () => RangeCalendar.Root, ($$anchor, RangeCalendar_Root) => {
			RangeCalendar_Root($$anchor, {
				get placeholder() {
					return $$props.placeholder;
				},

				get disabled() {
					return disabled();
				},

				get readonly() {
					return readonly();
				},

				get minValue() {
					return $$props.minValue;
				},

				get maxValue() {
					return $$props.maxValue;
				},
				'data-testid': 'calendar',
				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}