import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar } from "bits-ui";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import { cn } from "$lib/utils/styles.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<div class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full"></div> `, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"></div>`, 1);

export default function Range_calendar_demo_min_max($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let months = () => ($$arg0?.()).months;
			let weekdays = () => ($$arg0?.()).weekdays;
			var fragment_1 = root_4();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => RangeCalendar.Header, ($$anchor, RangeCalendar_Header) => {
				RangeCalendar_Header($$anchor, {
					class: 'flex items-center justify-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => RangeCalendar.PrevButton, ($$anchor, RangeCalendar_PrevButton) => {
							RangeCalendar_PrevButton($$anchor, {
								class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98]',
								children: ($$anchor, $$slotProps) => {
									CaretLeft($$anchor, { class: 'size-6' });
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => RangeCalendar.Heading, ($$anchor, RangeCalendar_Heading) => {
							RangeCalendar_Heading($$anchor, { class: 'text-[15px] font-medium' });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => RangeCalendar.NextButton, ($$anchor, RangeCalendar_NextButton) => {
							RangeCalendar_NextButton($$anchor, {
								class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98]',
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

			$.each(div, 21, months, (month) => month.value.month, ($$anchor, month) => {
				var fragment_5 = $.comment();
				var node_5 = $.first_child(fragment_5);

				$.component(node_5, () => RangeCalendar.Grid, ($$anchor, RangeCalendar_Grid) => {
					RangeCalendar_Grid($$anchor, {
						class: 'w-full border-collapse select-none space-y-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var node_6 = $.first_child(fragment_6);

							$.component(node_6, () => RangeCalendar.GridHead, ($$anchor, RangeCalendar_GridHead) => {
								RangeCalendar_GridHead($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_7 = $.first_child(fragment_7);

										$.component(node_7, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow) => {
											RangeCalendar_GridRow($$anchor, {
												class: 'mb-1 flex w-full justify-between',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_8 = $.first_child(fragment_8);

													$.each(node_8, 16, weekdays, (day) => day, ($$anchor, day) => {
														var fragment_9 = $.comment();
														var node_9 = $.first_child(fragment_9);

														$.component(node_9, () => RangeCalendar.HeadCell, ($$anchor, RangeCalendar_HeadCell) => {
															RangeCalendar_HeadCell($$anchor, {
																class: 'text-muted-foreground font-normal! w-10 rounded-md text-xs',
																children: ($$anchor, $$slotProps) => {
																	var div_1 = root_1();
																	var text = $.only_child(div_1, true);

																	$.template_effect(($0) => $.set_text(text, $0), [() => day.slice(0, 2)]);
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

							$.component(node_10, () => RangeCalendar.GridBody, ($$anchor, RangeCalendar_GridBody) => {
								RangeCalendar_GridBody($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_11 = $.first_child(fragment_10);

										$.each(node_11, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates) => {
											var fragment_11 = $.comment();
											var node_12 = $.first_child(fragment_11);

											$.component(node_12, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow_1) => {
												RangeCalendar_GridRow_1($$anchor, {
													class: 'flex w-full',
													children: ($$anchor, $$slotProps) => {
														var fragment_12 = $.comment();
														var node_13 = $.first_child(fragment_12);

														$.each(node_13, 17, () => $.get(weekDates), $.index, ($$anchor, date) => {
															var fragment_13 = $.comment();
															var node_14 = $.first_child(fragment_13);

															$.component(node_14, () => RangeCalendar.Cell, ($$anchor, RangeCalendar_Cell) => {
																RangeCalendar_Cell($$anchor, {
																	get date() {
																		return $.get(date);
																	},

																	get month() {
																		return $.get(month).value;
																	},
																	class: 'p-0! relative m-0 size-10 text-center text-sm focus-within:z-20',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = $.comment();
																		var node_15 = $.first_child(fragment_14);

																		{
																			let $0 = $.derived(() => cn("rounded-9px text-foreground hover:border-foreground focus-visible:ring-foreground! data-selection-end:rounded-9px data-selection-start:rounded-9px data-highlighted:bg-muted data-selected:bg-muted data-selection-end:bg-foreground data-selection-start:bg-foreground data-disabled:text-foreground/30 data-selected:text-foreground data-selection-end:text-background data-selection-start:text-background data-unavailable:text-muted-foreground data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:border-foreground data-disabled:pointer-events-none data-highlighted:rounded-none data-outside-month:pointer-events-none data-selected:font-medium data-selection-end:font-medium data-selection-start:font-medium data-selection-start:focus-visible:ring-2 data-selection-start:focus-visible:ring-offset-2! data-unavailable:line-through data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-0! data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-offset-0! group relative inline-flex size-10 items-center justify-center overflow-visible whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal"));

																			$.component(node_15, () => RangeCalendar.Day, ($$anchor, RangeCalendar_Day) => {
																				RangeCalendar_Day($$anchor, {
																					get class() {
																						return $.get($0);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_15 = root_2();
																						var text_1 = $.sibling($.first_child(fragment_15));

																						$.template_effect(() => $.set_text(text_1, ` ${$.get(date).day ?? ''}`));
																						$.append($$anchor, fragment_15);
																					},
																					$$slots: { default: true }
																				});
																			});
																		}

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

		$.component(node, () => RangeCalendar.Root, ($$anchor, RangeCalendar_Root) => {
			RangeCalendar_Root($$anchor, {
				class: 'rounded-15px border-dark-10 bg-background-alt shadow-card mt-6 border p-[22px]',
				weekdayFormat: 'short',
				fixedWeeks: true,
				maxDays: 10,
				minDays: 3,
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