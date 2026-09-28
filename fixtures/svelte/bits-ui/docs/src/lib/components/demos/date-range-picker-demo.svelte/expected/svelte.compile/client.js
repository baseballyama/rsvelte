import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateRangePicker } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";

var root = $.from_html(`<div class="inline-block select-none"><!></div>`);
var root_1 = $.from_html(`<div aria-hidden="true" class="text-muted-foreground px-1">–⁠⁠⁠⁠⁠</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div> </div>`);
var root_5 = $.from_html(`<div class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full transition-all"></div> `, 1);
var root_6 = $.from_html(`<!> <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"></div>`, 1);
var root_7 = $.from_html(`<!> <div class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover flex w-full select-none items-center border px-2 py-3 text-sm tracking-[0.01em]"><!> <!></div> <!>`, 1);

export default function Date_range_picker_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DateRangePicker.Root, ($$anchor, DateRangePicker_Root) => {
		DateRangePicker_Root($$anchor, {
			weekdayFormat: 'short',
			fixedWeeks: true,
			class: 'flex w-full max-w-[340px] flex-col gap-1.5',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_7();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => DateRangePicker.Label, ($$anchor, DateRangePicker_Label) => {
					DateRangePicker_Label($$anchor, {
						class: 'block select-none text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Rental Days');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var div = $.sibling(node_1, 2);
				var node_2 = $.child(div);

				$.each(node_2, 16, () => ["start", "end"], (type) => type, ($$anchor, type) => {
					var fragment_2 = root_2();
					var node_3 = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let segments = () => ($$arg0?.()).segments;
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 19, segments, ({ part, value }, i) => part + i, ($$anchor, $$item) => {
								let part = () => $.get($$item).part;
								let value = () => $.get($$item).value;
								var div_1 = root();
								var node_5 = $.child(div_1);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => DateRangePicker.Segment, ($$anchor, DateRangePicker_Segment) => {
											DateRangePicker_Segment($$anchor, {
												get part() {
													return part();
												},
												class: 'text-muted-foreground p-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, value()));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var fragment_6 = $.comment();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => DateRangePicker.Segment, ($$anchor, DateRangePicker_Segment_1) => {
											DateRangePicker_Segment_1($$anchor, {
												get part() {
													return part();
												},
												class: 'rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, value()));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									};

									$.if(node_5, ($$render) => {
										if (part() === "literal") $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.reset(div_1);
								$.append($$anchor, div_1);
							});

							$.append($$anchor, fragment_3);
						};

						$.component(node_3, () => DateRangePicker.Input, ($$anchor, DateRangePicker_Input) => {
							DateRangePicker_Input($$anchor, {
								get type() {
									return type;
								},
								children,
								$$slots: { default: true }
							});
						});
					}

					var node_8 = $.sibling(node_3, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_2 = root_1();

							$.append($$anchor, div_2);
						};

						$.if(node_8, ($$render) => {
							if (type === "start") $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_2);
				});

				var node_9 = $.sibling(node_2, 2);

				$.component(node_9, () => DateRangePicker.Trigger, ($$anchor, DateRangePicker_Trigger) => {
					DateRangePicker_Trigger($$anchor, {
						class: 'text-foreground/60 hover:bg-muted active:bg-dark-10 ml-auto inline-flex size-8 items-center justify-center rounded-[5px] transition-all',
						children: ($$anchor, $$slotProps) => {
							CalendarBlank($$anchor, { class: 'size-6' });
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_10 = $.sibling(div, 2);

				$.component(node_10, () => DateRangePicker.Content, ($$anchor, DateRangePicker_Content) => {
					DateRangePicker_Content($$anchor, {
						sideOffset: 6,
						class: 'z-50',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = $.comment();
							var node_11 = $.first_child(fragment_9);

							{
								const children = ($$anchor, $$arg0) => {
									let months = () => ($$arg0?.()).months;
									let weekdays = () => ($$arg0?.()).weekdays;
									var fragment_10 = root_6();
									var node_12 = $.first_child(fragment_10);

									$.component(node_12, () => DateRangePicker.Header, ($$anchor, DateRangePicker_Header) => {
										DateRangePicker_Header($$anchor, {
											class: 'flex items-center justify-between',
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_3();
												var node_13 = $.first_child(fragment_11);

												$.component(node_13, () => DateRangePicker.PrevButton, ($$anchor, DateRangePicker_PrevButton) => {
													DateRangePicker_PrevButton($$anchor, {
														class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
														children: ($$anchor, $$slotProps) => {
															CaretLeft($$anchor, { class: 'size-6' });
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => DateRangePicker.Heading, ($$anchor, DateRangePicker_Heading) => {
													DateRangePicker_Heading($$anchor, { class: 'text-[15px] font-medium' });
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => DateRangePicker.NextButton, ($$anchor, DateRangePicker_NextButton) => {
													DateRangePicker_NextButton($$anchor, {
														class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
														children: ($$anchor, $$slotProps) => {
															CaretRight($$anchor, { class: 'size-6' });
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									var div_3 = $.sibling(node_12, 2);

									$.each(div_3, 21, months, (month) => month.value, ($$anchor, month) => {
										var fragment_14 = $.comment();
										var node_16 = $.first_child(fragment_14);

										$.component(node_16, () => DateRangePicker.Grid, ($$anchor, DateRangePicker_Grid) => {
											DateRangePicker_Grid($$anchor, {
												class: 'w-full border-collapse select-none space-y-1',
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_2();
													var node_17 = $.first_child(fragment_15);

													$.component(node_17, () => DateRangePicker.GridHead, ($$anchor, DateRangePicker_GridHead) => {
														DateRangePicker_GridHead($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = $.comment();
																var node_18 = $.first_child(fragment_16);

																$.component(node_18, () => DateRangePicker.GridRow, ($$anchor, DateRangePicker_GridRow) => {
																	DateRangePicker_GridRow($$anchor, {
																		class: 'mb-1 flex w-full justify-between',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_17 = $.comment();
																			var node_19 = $.first_child(fragment_17);

																			$.each(node_19, 16, weekdays, (day) => day, ($$anchor, day) => {
																				var fragment_18 = $.comment();
																				var node_20 = $.first_child(fragment_18);

																				$.component(node_20, () => DateRangePicker.HeadCell, ($$anchor, DateRangePicker_HeadCell) => {
																					DateRangePicker_HeadCell($$anchor, {
																						class: 'text-muted-foreground font-normal! w-10 rounded-md text-xs',
																						children: ($$anchor, $$slotProps) => {
																							var div_4 = root_4();
																							var text_3 = $.only_child(div_4, true);

																							$.template_effect(($0) => $.set_text(text_3, $0), [() => day.slice(0, 2)]);
																							$.append($$anchor, div_4);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_18);
																			});

																			$.append($$anchor, fragment_17);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													var node_21 = $.sibling(node_17, 2);

													$.component(node_21, () => DateRangePicker.GridBody, ($$anchor, DateRangePicker_GridBody) => {
														DateRangePicker_GridBody($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = $.comment();
																var node_22 = $.first_child(fragment_19);

																$.each(node_22, 16, () => $.get(month).weeks, (weekDates) => weekDates, ($$anchor, weekDates) => {
																	var fragment_20 = $.comment();
																	var node_23 = $.first_child(fragment_20);

																	$.component(node_23, () => DateRangePicker.GridRow, ($$anchor, DateRangePicker_GridRow_1) => {
																		DateRangePicker_GridRow_1($$anchor, {
																			class: 'flex w-full',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_21 = $.comment();
																				var node_24 = $.first_child(fragment_21);

																				$.each(node_24, 16, () => weekDates, (date) => date, ($$anchor, date) => {
																					var fragment_22 = $.comment();
																					var node_25 = $.first_child(fragment_22);

																					$.component(node_25, () => DateRangePicker.Cell, ($$anchor, DateRangePicker_Cell) => {
																						DateRangePicker_Cell($$anchor, {
																							get date() {
																								return date;
																							},

																							get month() {
																								return $.get(month).value;
																							},
																							class: 'p-0! relative m-0 size-10 overflow-visible text-center text-sm focus-within:relative focus-within:z-20',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_23 = $.comment();
																								var node_26 = $.first_child(fragment_23);

																								$.component(node_26, () => DateRangePicker.Day, ($$anchor, DateRangePicker_Day) => {
																									DateRangePicker_Day($$anchor, {
																										class: 'rounded-9px text-foreground hover:border-foreground focus-visible:ring-foreground! data-selection-end:rounded-9px data-selection-start:rounded-9px data-highlighted:bg-muted data-selected:bg-muted data-selection-end:bg-foreground data-selection-start:bg-foreground data-disabled:text-foreground/30 data-selected:text-foreground data-selection-end:text-background data-selection-start:text-background data-unavailable:text-muted-foreground data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:border-foreground data-disabled:pointer-events-none data-highlighted:rounded-none  data-outside-month:pointer-events-none data-selected:font-medium data-selection-end:font-medium data-selection-start:font-medium data-selection-start:focus-visible:ring-2 data-selection-start:focus-visible:ring-offset-2! data-unavailable:line-through data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-0! data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-offset-0! group relative inline-flex size-10 items-center justify-center overflow-visible whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal transition-all',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_24 = root_5();
																											var text_4 = $.sibling($.first_child(fragment_24));

																											$.template_effect(() => $.set_text(text_4, ` ${date.day ?? ''}`));
																											$.append($$anchor, fragment_24);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_23);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_22);
																				});

																				$.append($$anchor, fragment_21);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_20);
																});

																$.append($$anchor, fragment_19);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_14);
									});

									$.reset(div_3);
									$.append($$anchor, fragment_10);
								};

								$.component(node_11, () => DateRangePicker.Calendar, ($$anchor, DateRangePicker_Calendar) => {
									DateRangePicker_Calendar($$anchor, {
										class: 'rounded-15px border-dark-10 bg-background-alt shadow-popover mt-6 border p-[22px]',
										children,
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}