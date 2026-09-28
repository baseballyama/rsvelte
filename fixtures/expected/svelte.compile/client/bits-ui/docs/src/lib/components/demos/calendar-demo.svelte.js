import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar } from "bits-ui";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import { getLocalTimeZone, today } from "@internationalized/date";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<div class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full"></div> `, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"></div>`, 1);

export default function Calendar_demo($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy(today(getLocalTimeZone())));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let months = () => ($$arg0?.()).months;
			let weekdays = () => ($$arg0?.()).weekdays;
			var fragment_1 = root_4();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Calendar.Header, ($$anchor, Calendar_Header) => {
				Calendar_Header($$anchor, {
					class: 'flex items-center justify-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Calendar.PrevButton, ($$anchor, Calendar_PrevButton) => {
							Calendar_PrevButton($$anchor, {
								class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98] active:transition-all',
								children: ($$anchor, $$slotProps) => {
									CaretLeft($$anchor, { class: 'size-6' });
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Calendar.Heading, ($$anchor, Calendar_Heading) => {
							Calendar_Heading($$anchor, { class: 'text-[15px] font-medium' });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Calendar.NextButton, ($$anchor, Calendar_NextButton) => {
							Calendar_NextButton($$anchor, {
								class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98] active:transition-all',
								children: ($$anchor, $$slotProps) => {
									CaretRight($$anchor, { class: 'size-6' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var div = $.sibling(node_1, 2);

			$.each(div, 21, months, $.index, ($$anchor, month) => {
				var fragment_5 = $.comment();
				var node_5 = $.first_child(fragment_5);

				$.component(node_5, () => Calendar.Grid, ($$anchor, Calendar_Grid) => {
					Calendar_Grid($$anchor, {
						class: 'w-full border-collapse select-none space-y-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var node_6 = $.first_child(fragment_6);

							$.component(node_6, () => Calendar.GridHead, ($$anchor, Calendar_GridHead) => {
								Calendar_GridHead($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_7 = $.first_child(fragment_7);

										$.component(node_7, () => Calendar.GridRow, ($$anchor, Calendar_GridRow) => {
											Calendar_GridRow($$anchor, {
												class: 'mb-1 flex w-full justify-between',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_8 = $.first_child(fragment_8);

													$.each(node_8, 17, weekdays, $.index, ($$anchor, day, i, $$array) => {
														var fragment_9 = $.comment();
														var node_9 = $.first_child(fragment_9);

														$.component(node_9, () => Calendar.HeadCell, ($$anchor, Calendar_HeadCell) => {
															Calendar_HeadCell($$anchor, {
																class: 'text-muted-foreground font-normal! w-10 rounded-md text-xs',
																children: ($$anchor, $$slotProps) => {
																	var div_1 = root_1();
																	var text = $.only_child(div_1, true);

																	$.template_effect(($0) => $.set_text(text, $0), [() => $.get(day).slice(0, 2)]);
																	$.append($$anchor, div_1);
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
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_6, 2);

							$.component(node_10, () => Calendar.GridBody, ($$anchor, Calendar_GridBody) => {
								Calendar_GridBody($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_11 = $.first_child(fragment_10);

										$.each(node_11, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates, i, $$array_1) => {
											var fragment_11 = $.comment();
											var node_12 = $.first_child(fragment_11);

											$.component(node_12, () => Calendar.GridRow, ($$anchor, Calendar_GridRow_1) => {
												Calendar_GridRow_1($$anchor, {
													class: 'flex w-full',
													children: ($$anchor, $$slotProps) => {
														var fragment_12 = $.comment();
														var node_13 = $.first_child(fragment_12);

														$.each(node_13, 17, () => $.get(weekDates), $.index, ($$anchor, date, i, $$array_2) => {
															var fragment_13 = $.comment();
															var node_14 = $.first_child(fragment_13);

															$.component(node_14, () => Calendar.Cell, ($$anchor, Calendar_Cell) => {
																Calendar_Cell($$anchor, {
																	get date() {
																		return $.get(date);
																	},

																	get month() {
																		return $.get(month).value;
																	},
																	class: 'p-0! relative size-10 text-center text-sm',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = $.comment();
																		var node_15 = $.first_child(fragment_14);

																		$.component(node_15, () => Calendar.Day, ($$anchor, Calendar_Day) => {
																			Calendar_Day($$anchor, {
																				class: 'rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_15 = root_2();
																					var text_1 = $.sibling($.first_child(fragment_15));

																					$.template_effect(() => $.set_text(text_1, ` ${$.get(date).day ?? ''}`));
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

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		};

		$.component(node, () => Calendar.Root, ($$anchor, Calendar_Root) => {
			Calendar_Root($$anchor, {
				class: 'border-dark-10 bg-background-alt shadow-card mt-6 rounded-[15px] border p-[22px]',
				weekdayFormat: 'short',
				fixedWeeks: true,
				type: 'single',
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}