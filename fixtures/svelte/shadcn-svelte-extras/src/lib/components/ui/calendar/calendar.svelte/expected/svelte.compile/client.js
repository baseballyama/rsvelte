import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar as CalendarPrimitive } from 'bits-ui';
import * as Calendar from './index.js';
import { cn } from '$lib/utils.js';
import { isEqualMonth } from '@internationalized/date';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'placeholder',
	'class',
	'weekdayFormat',
	'buttonVariant',
	'captionLayout',
	'locale',
	'months',
	'years',
	'monthFormat',
	'yearFormat',
	'day',
	'disableDaysOutsideMonth'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Calendar_1($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		placeholder = $.prop($$props, 'placeholder', 15),
		weekdayFormat = $.prop($$props, 'weekdayFormat', 3, 'short'),
		buttonVariant = $.prop($$props, 'buttonVariant', 3, 'ghost'),
		captionLayout = $.prop($$props, 'captionLayout', 3, 'label'),
		locale = $.prop($$props, 'locale', 3, 'en-US'),
		yearFormat = $.prop($$props, 'yearFormat', 3, 'numeric'),
		disableDaysOutsideMonth = $.prop($$props, 'disableDaysOutsideMonth', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const monthFormat = $.derived(() => {
		if ($$props.monthFormat) return $$props.monthFormat;
		if (captionLayout().startsWith('dropdown')) return 'short';

		return 'long';
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let months = () => ($$arg0?.()).months;
			let weekdays = () => ($$arg0?.()).weekdays;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Calendar.Months, ($$anchor, Calendar_Months) => {
				Calendar_Months($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Calendar.Nav, ($$anchor, Calendar_Nav) => {
							Calendar_Nav($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Calendar.PrevButton, ($$anchor, Calendar_PrevButton) => {
										Calendar_PrevButton($$anchor, {
											get variant() {
												return buttonVariant();
											}
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Calendar.NextButton, ($$anchor, Calendar_NextButton) => {
										Calendar_NextButton($$anchor, {
											get variant() {
												return buttonVariant();
											}
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_2, 2);

						$.each(node_5, 18, months, (month) => month, ($$anchor, month, monthIndex) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => Calendar.Month, ($$anchor, Calendar_Month) => {
								Calendar_Month($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Calendar.Header, ($$anchor, Calendar_Header) => {
											Calendar_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => Calendar.Caption, ($$anchor, Calendar_Caption) => {
														Calendar_Caption($$anchor, {
															get captionLayout() {
																return captionLayout();
															},

															get months() {
																return $$props.months;
															},

															get monthFormat() {
																return $.get(monthFormat);
															},

															get years() {
																return $$props.years;
															},

															get yearFormat() {
																return yearFormat();
															},

															get month() {
																return month.value;
															},

															get locale() {
																return locale();
															},

															get monthIndex() {
																return $.get(monthIndex);
															},

															get placeholder() {
																return placeholder();
															},

															set placeholder($$value) {
																placeholder($$value);
															}
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => Calendar.Grid, ($$anchor, Calendar_Grid) => {
											Calendar_Grid($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_10 = $.first_child(fragment_7);

													$.component(node_10, () => Calendar.GridHead, ($$anchor, Calendar_GridHead) => {
														Calendar_GridHead($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_11 = $.first_child(fragment_8);

																$.component(node_11, () => Calendar.GridRow, ($$anchor, Calendar_GridRow) => {
																	Calendar_GridRow($$anchor, {
																		class: 'select-none',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = $.comment();
																			var node_12 = $.first_child(fragment_9);

																			$.each(node_12, 16, weekdays, (weekday) => weekday, ($$anchor, weekday) => {
																				var fragment_10 = $.comment();
																				var node_13 = $.first_child(fragment_10);

																				$.component(node_13, () => Calendar.HeadCell, ($$anchor, Calendar_HeadCell) => {
																					Calendar_HeadCell($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text = $.text();

																							$.template_effect(($0) => $.set_text(text, $0), [() => weekday.slice(0, 2)]);
																							$.append($$anchor, text);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_10);
																			});

																			$.append($$anchor, fragment_9);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_10, 2);

													$.component(node_14, () => Calendar.GridBody, ($$anchor, Calendar_GridBody) => {
														Calendar_GridBody($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_15 = $.first_child(fragment_12);

																$.each(node_15, 16, () => month.weeks, (weekDates) => weekDates, ($$anchor, weekDates) => {
																	var fragment_13 = $.comment();
																	var node_16 = $.first_child(fragment_13);

																	$.component(node_16, () => Calendar.GridRow, ($$anchor, Calendar_GridRow_1) => {
																		Calendar_GridRow_1($$anchor, {
																			class: 'mt-2 w-full',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = $.comment();
																				var node_17 = $.first_child(fragment_14);

																				$.each(node_17, 16, () => weekDates, (date) => date, ($$anchor, date) => {
																					var fragment_15 = $.comment();
																					var node_18 = $.first_child(fragment_15);

																					$.component(node_18, () => Calendar.Cell, ($$anchor, Calendar_Cell) => {
																						Calendar_Cell($$anchor, {
																							get date() {
																								return date;
																							},

																							get month() {
																								return month.value;
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_16 = $.comment();
																								var node_19 = $.first_child(fragment_16);

																								{
																									var consequent = ($$anchor) => {
																										var fragment_17 = $.comment();
																										var node_20 = $.first_child(fragment_17);

																										{
																											let $0 = $.derived(() => ({ day: date, outsideMonth: !isEqualMonth(date, month.value) }));

																											$.snippet(node_20, () => $$props.day, () => $.get($0));
																										}

																										$.append($$anchor, fragment_17);
																									};

																									var alternate = ($$anchor) => {
																										var fragment_18 = $.comment();
																										var node_21 = $.first_child(fragment_18);

																										$.component(node_21, () => Calendar.Day, ($$anchor, Calendar_Day) => {
																											Calendar_Day($$anchor, {});
																										});

																										$.append($$anchor, fragment_18);
																									};

																									$.if(node_19, ($$render) => {
																										if ($$props.day) $$render(consequent); else $$render(alternate, -1);
																									});
																								}

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

																	$.append($$anchor, fragment_13);
																});

																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
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
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('bg-background group/calendar p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent', $$props.class));

		$.component(node, () => CalendarPrimitive.Root, ($$anchor, CalendarPrimitive_Root) => {
			CalendarPrimitive_Root($$anchor, $.spread_props(
				{
					get weekdayFormat() {
						return weekdayFormat();
					},

					get disableDaysOutsideMonth() {
						return disableDaysOutsideMonth();
					},

					get class() {
						return $.get($0);
					},

					get locale() {
						return locale();
					},

					get monthFormat() {
						return $.get(monthFormat);
					},

					get yearFormat() {
						return yearFormat();
					}
				},
				() => restProps,
				{
					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},

					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					get placeholder() {
						return placeholder();
					},

					set placeholder($$value) {
						placeholder($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}