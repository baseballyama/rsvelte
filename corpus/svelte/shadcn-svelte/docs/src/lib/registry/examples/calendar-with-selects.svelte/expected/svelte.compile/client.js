import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
import { Calendar as CalendarPrimitive } from "bits-ui";
import * as Calendar from "$lib/registry/ui/calendar/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Calendar_with_selects($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(void 0);
	let placeholder = $.state(void 0);
	const currentDate = today(getLocalTimeZone());
	const monthFmt = new DateFormatter("en-US", { month: "long" });

	const monthOptions = Array.from({ length: 12 }, (_, i) => {
		const month = currentDate.set({ month: i + 1 });

		return {
			value: month.month,
			label: monthFmt.format(month.toDate(getLocalTimeZone()))
		};
	});

	const yearOptions = Array.from({ length: 100 }, (_, i) => ({
		label: String(new Date().getFullYear() - i),
		value: new Date().getFullYear() - i
	}));

	const defaultYear = $.derived(() => $.get(placeholder)
		? {
			value: $.get(placeholder).year,
			label: String($.get(placeholder).year)
		}
		: undefined);

	const defaultMonth = $.derived(() => $.get(placeholder)
		? {
			value: $.get(placeholder).month,
			label: monthFmt.format($.get(placeholder).toDate(getLocalTimeZone()))
		}
		: undefined);

	const monthLabel = $.derived(() => monthOptions.find((m) => m.value === $.get(defaultMonth)?.value)?.label ?? "Select a month");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let months = () => ($$arg0?.()).months;
			let weekdays = () => ($$arg0?.()).weekdays;
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Calendar.Header, ($$anchor, Calendar_Header) => {
				Calendar_Header($$anchor, {
					class: 'flex w-full items-center justify-between gap-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => `${$.get(defaultMonth)?.value}`);

							$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get($0);
									},

									onValueChange: (v) => {
										if (!$.get(placeholder)) return;
										if (v === `${$.get(placeholder).month}`) return;

										$.set(placeholder, $.get(placeholder).set({ month: Number.parseInt(v) }), true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												'aria-label': 'Select month',
												class: 'w-[60%]',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, $.get(monthLabel)));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												class: 'max-h-[200px] overflow-y-auto',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													$.each(node_5, 17, () => monthOptions, ({ value, label }) => value, ($$anchor, $$item, $$index, $$array) => {
														let value = () => $.get($$item).value;
														let label = () => $.get($$item).label;
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														{
															let $0 = $.derived(() => `${value()}`);

															$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	get value() {
																		return $.get($0);
																	},

																	get label() {
																		return label();
																	}
																});
															});
														}

														$.append($$anchor, fragment_6);
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_7 = $.sibling(node_2, 2);

						{
							let $0 = $.derived(() => `${$.get(defaultYear)?.value}`);

							$.component(node_7, () => Select.Root, ($$anchor, Select_Root_1) => {
								Select_Root_1($$anchor, {
									type: 'single',
									get value() {
										return $.get($0);
									},

									onValueChange: (v) => {
										if (!v || !$.get(placeholder)) return;
										if (v === `${$.get(placeholder)?.year}`) return;

										$.set(placeholder, $.get(placeholder).set({ year: Number.parseInt(v) }), true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_8 = $.first_child(fragment_7);

										$.component(node_8, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
											Select_Trigger_1($$anchor, {
												'aria-label': 'Select year',
												class: 'w-[40%]',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(defaultYear)?.label ?? "Select year"));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Select.Content, ($$anchor, Select_Content_1) => {
											Select_Content_1($$anchor, {
												class: 'max-h-[200px] overflow-y-auto',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_10 = $.first_child(fragment_9);

													$.each(node_10, 17, () => yearOptions, ({ value, label }) => value, ($$anchor, $$item, $$index_1, $$array_1) => {
														let value = () => $.get($$item).value;
														let label = () => $.get($$item).label;
														var fragment_10 = $.comment();
														var node_11 = $.first_child(fragment_10);

														{
															let $0 = $.derived(() => `${value()}`);

															$.component(node_11, () => Select.Item, ($$anchor, Select_Item_1) => {
																Select_Item_1($$anchor, {
																	get value() {
																		return $.get($0);
																	},

																	get label() {
																		return label();
																	}
																});
															});
														}

														$.append($$anchor, fragment_10);
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_1, 2);

			$.component(node_12, () => Calendar.Months, ($$anchor, Calendar_Months) => {
				Calendar_Months($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = $.comment();
						var node_13 = $.first_child(fragment_11);

						$.each(node_13, 16, months, (month) => month, ($$anchor, month) => {
							var fragment_12 = $.comment();
							var node_14 = $.first_child(fragment_12);

							$.component(node_14, () => Calendar.Grid, ($$anchor, Calendar_Grid) => {
								Calendar_Grid($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = root();
										var node_15 = $.first_child(fragment_13);

										$.component(node_15, () => Calendar.GridHead, ($$anchor, Calendar_GridHead) => {
											Calendar_GridHead($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = $.comment();
													var node_16 = $.first_child(fragment_14);

													$.component(node_16, () => Calendar.GridRow, ($$anchor, Calendar_GridRow) => {
														Calendar_GridRow($$anchor, {
															class: 'flex',
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = $.comment();
																var node_17 = $.first_child(fragment_15);

																$.each(node_17, 16, weekdays, (weekday) => weekday, ($$anchor, weekday) => {
																	var fragment_16 = $.comment();
																	var node_18 = $.first_child(fragment_16);

																	$.component(node_18, () => Calendar.HeadCell, ($$anchor, Calendar_HeadCell) => {
																		Calendar_HeadCell($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text();

																				$.template_effect(($0) => $.set_text(text_2, $0), [() => weekday.slice(0, 2)]);
																				$.append($$anchor, text_2);
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
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_15, 2);

										$.component(node_19, () => Calendar.GridBody, ($$anchor, Calendar_GridBody) => {
											Calendar_GridBody($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = $.comment();
													var node_20 = $.first_child(fragment_18);

													$.each(node_20, 16, () => month.weeks, (weekDates) => weekDates, ($$anchor, weekDates) => {
														var fragment_19 = $.comment();
														var node_21 = $.first_child(fragment_19);

														$.component(node_21, () => Calendar.GridRow, ($$anchor, Calendar_GridRow_1) => {
															Calendar_GridRow_1($$anchor, {
																class: 'mt-2 w-full',
																children: ($$anchor, $$slotProps) => {
																	var fragment_20 = $.comment();
																	var node_22 = $.first_child(fragment_20);

																	$.each(node_22, 16, () => weekDates, (date) => date, ($$anchor, date) => {
																		var fragment_21 = $.comment();
																		var node_23 = $.first_child(fragment_21);

																		$.component(node_23, () => Calendar.Cell, ($$anchor, Calendar_Cell) => {
																			Calendar_Cell($$anchor, {
																				class: 'select-none',
																				get date() {
																					return date;
																				},

																				get month() {
																					return month.value;
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_22 = $.comment();
																					var node_24 = $.first_child(fragment_22);

																					$.component(node_24, () => Calendar.Day, ($$anchor, Calendar_Day) => {
																						Calendar_Day($$anchor, {});
																					});

																					$.append($$anchor, fragment_22);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_21);
																	});

																	$.append($$anchor, fragment_20);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_19);
													});

													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
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

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn("rounded-md border p-3"));

		$.component(node, () => CalendarPrimitive.Root, ($$anchor, CalendarPrimitive_Root) => {
			CalendarPrimitive_Root($$anchor, {
				type: 'single',
				weekdayFormat: 'short',
				get class() {
					return $.get($0);
				},

				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},

				get placeholder() {
					return $.get(placeholder);
				},

				set placeholder($$value) {
					$.set(placeholder, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}