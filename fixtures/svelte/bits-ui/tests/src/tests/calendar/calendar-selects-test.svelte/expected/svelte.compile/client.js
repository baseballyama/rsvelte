import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="header"><!> <!></div> <div data-testid="calendar-grid"></div>`, 1);

export default function Calendar_selects_test($$anchor, $$props) {
	let disabled = $.prop($$props, 'disabled', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let calendarMonths = () => ($$arg0?.()).months;
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			$.component(node_1, () => Calendar.MonthSelect, ($$anchor, Calendar_MonthSelect) => {
				Calendar_MonthSelect($$anchor, {
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

			$.component(node_2, () => Calendar.YearSelect, ($$anchor, Calendar_YearSelect) => {
				Calendar_YearSelect($$anchor, {
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

			$.each(div_1, 21, calendarMonths, $.index, ($$anchor, month) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => Calendar.Grid, ($$anchor, Calendar_Grid) => {
					Calendar_Grid($$anchor, {
						get 'data-testid'() {
							return `grid-${$.get(month).value.month ?? ''}`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Calendar.GridHead, ($$anchor, Calendar_GridHead) => {
								Calendar_GridHead($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Calendar.GridRow, ($$anchor, Calendar_GridRow) => {
											Calendar_GridRow($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => Calendar.HeadCell, ($$anchor, Calendar_HeadCell) => {
														Calendar_HeadCell($$anchor, {
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

							$.component(node_7, () => Calendar.GridBody, ($$anchor, Calendar_GridBody) => {
								Calendar_GridBody($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_8 = $.first_child(fragment_6);

										$.each(node_8, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates) => {
											var fragment_7 = $.comment();
											var node_9 = $.first_child(fragment_7);

											$.component(node_9, () => Calendar.GridRow, ($$anchor, Calendar_GridRow_1) => {
												Calendar_GridRow_1($$anchor, {
													'data-week': true,
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = $.comment();
														var node_10 = $.first_child(fragment_8);

														$.each(node_10, 17, () => $.get(weekDates), $.index, ($$anchor, date) => {
															var fragment_9 = $.comment();
															var node_11 = $.first_child(fragment_9);

															$.component(node_11, () => Calendar.Cell, ($$anchor, Calendar_Cell) => {
																Calendar_Cell($$anchor, {
																	get date() {
																		return $.get(date);
																	},

																	get month() {
																		return $.get(month).value;
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_12 = $.first_child(fragment_10);

																		$.component(node_12, () => Calendar.Day, ($$anchor, Calendar_Day) => {
																			Calendar_Day($$anchor, {
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

		$.component(node, () => Calendar.Root, ($$anchor, Calendar_Root) => {
			Calendar_Root($$anchor, {
				type: 'single',
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
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
}