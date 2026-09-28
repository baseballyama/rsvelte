import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import * as RangeCalendar from './index';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'placeholder',
	'class',
	'weekdayFormat'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Range_calendar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		placeholder = $.prop($$props, 'placeholder', 15),
		weekdayFormat = $.prop($$props, 'weekdayFormat', 3, 'short'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let months = () => ($$arg0?.()).months;
			let weekdays = () => ($$arg0?.()).weekdays;
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => RangeCalendar.Header, ($$anchor, RangeCalendar_Header) => {
				RangeCalendar_Header($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => RangeCalendar.PrevButton, ($$anchor, RangeCalendar_PrevButton) => {
							RangeCalendar_PrevButton($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => RangeCalendar.Heading, ($$anchor, RangeCalendar_Heading) => {
							RangeCalendar_Heading($$anchor, {});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => RangeCalendar.NextButton, ($$anchor, RangeCalendar_NextButton) => {
							RangeCalendar_NextButton($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_1, 2);

			$.component(node_5, () => RangeCalendar.Months, ($$anchor, RangeCalendar_Months) => {
				RangeCalendar_Months($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						$.each(node_6, 17, months, $.index, ($$anchor, month) => {
							var fragment_4 = $.comment();
							var node_7 = $.first_child(fragment_4);

							$.component(node_7, () => RangeCalendar.Grid, ($$anchor, RangeCalendar_Grid) => {
								RangeCalendar_Grid($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_8 = $.first_child(fragment_5);

										$.component(node_8, () => RangeCalendar.GridHead, ($$anchor, RangeCalendar_GridHead) => {
											RangeCalendar_GridHead($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_9 = $.first_child(fragment_6);

													$.component(node_9, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow) => {
														RangeCalendar_GridRow($$anchor, {
															class: 'flex',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_10 = $.first_child(fragment_7);

																$.each(node_10, 17, weekdays, $.index, ($$anchor, weekday) => {
																	var fragment_8 = $.comment();
																	var node_11 = $.first_child(fragment_8);

																	$.component(node_11, () => RangeCalendar.HeadCell, ($$anchor, RangeCalendar_HeadCell) => {
																		RangeCalendar_HeadCell($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text = $.text();

																				$.template_effect(($0) => $.set_text(text, $0), [() => $.get(weekday).slice(0, 2)]);
																				$.append($$anchor, text);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_8);
																});

																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_8, 2);

										$.component(node_12, () => RangeCalendar.GridBody, ($$anchor, RangeCalendar_GridBody) => {
											RangeCalendar_GridBody($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = $.comment();
													var node_13 = $.first_child(fragment_10);

													$.each(node_13, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates) => {
														var fragment_11 = $.comment();
														var node_14 = $.first_child(fragment_11);

														$.component(node_14, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow_1) => {
															RangeCalendar_GridRow_1($$anchor, {
																class: 'mt-2 w-full',
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = $.comment();
																	var node_15 = $.first_child(fragment_12);

																	$.each(node_15, 17, () => $.get(weekDates), $.index, ($$anchor, date) => {
																		var fragment_13 = $.comment();
																		var node_16 = $.first_child(fragment_13);

																		$.component(node_16, () => RangeCalendar.Cell, ($$anchor, RangeCalendar_Cell) => {
																			RangeCalendar_Cell($$anchor, {
																				get date() {
																					return $.get(date);
																				},

																				get month() {
																					return $.get(month).value;
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = $.comment();
																					var node_17 = $.first_child(fragment_14);

																					$.component(node_17, () => RangeCalendar.Day, ($$anchor, RangeCalendar_Day) => {
																						RangeCalendar_Day($$anchor, {});
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

														$.append($$anchor, fragment_11);
													});

													$.append($$anchor, fragment_10);
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

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('p-3', $$props.class));

		$.component(node, () => RangeCalendarPrimitive.Root, ($$anchor, RangeCalendarPrimitive_Root) => {
			RangeCalendarPrimitive_Root($$anchor, $.spread_props(
				{
					get weekdayFormat() {
						return weekdayFormat();
					},

					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

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
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}