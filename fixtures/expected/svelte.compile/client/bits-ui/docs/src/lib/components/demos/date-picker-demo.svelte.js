import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";

var root = $.from_html(`<div class="inline-block select-none"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div> </div>`);
var root_4 = $.from_html(`<div class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full transition-all"></div> `, 1);
var root_5 = $.from_html(`<!> <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"></div>`, 1);
var root_6 = $.from_html(`<div class="flex w-full max-w-[232px] flex-col gap-1.5"><!> <!> <!></div>`);

export default function Date_picker_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DatePicker.Root, ($$anchor, DatePicker_Root) => {
		DatePicker_Root($$anchor, {
			weekdayFormat: 'short',
			fixedWeeks: true,
			children: ($$anchor, $$slotProps) => {
				var div = root_6();
				var node_1 = $.child(div);

				$.component(node_1, () => DatePicker.Label, ($$anchor, DatePicker_Label) => {
					DatePicker_Label($$anchor, {
						class: 'block select-none text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Birthday');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let segments = () => ($$arg0?.()).segments;
						var fragment_1 = root_1();
						var node_3 = $.first_child(fragment_1);

						$.each(node_3, 19, segments, ({ part, value }, i) => part + i, ($$anchor, $$item) => {
							let part = () => $.get($$item).part;
							let value = () => $.get($$item).value;
							var div_1 = root();
							var node_4 = $.child(div_1);

							{
								var consequent = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => DatePicker.Segment, ($$anchor, DatePicker_Segment) => {
										DatePicker_Segment($$anchor, {
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

									$.append($$anchor, fragment_2);
								};

								var alternate = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => DatePicker.Segment, ($$anchor, DatePicker_Segment_1) => {
										DatePicker_Segment_1($$anchor, {
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

									$.append($$anchor, fragment_4);
								};

								$.if(node_4, ($$render) => {
									if (part() === "literal") $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div_1);
							$.append($$anchor, div_1);
						});

						var node_7 = $.sibling(node_3, 2);

						$.component(node_7, () => DatePicker.Trigger, ($$anchor, DatePicker_Trigger) => {
							DatePicker_Trigger($$anchor, {
								class: 'text-foreground/60 hover:bg-muted active:bg-dark-10 ml-auto inline-flex size-8 items-center justify-center rounded-[5px] transition-all',
								children: ($$anchor, $$slotProps) => {
									CalendarBlank($$anchor, { class: 'size-6' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_2, () => DatePicker.Input, ($$anchor, DatePicker_Input) => {
						DatePicker_Input($$anchor, {
							class: 'h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover flex w-full max-w-[232px] select-none items-center border px-2 py-3 text-sm tracking-[0.01em]',
							children,
							$$slots: { default: true }
						});
					});
				}

				var node_8 = $.sibling(node_2, 2);

				$.component(node_8, () => DatePicker.Content, ($$anchor, DatePicker_Content) => {
					DatePicker_Content($$anchor, {
						sideOffset: 6,
						class: 'z-50',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_9 = $.first_child(fragment_7);

							{
								const children = ($$anchor, $$arg0) => {
									let months = () => ($$arg0?.()).months;
									let weekdays = () => ($$arg0?.()).weekdays;
									var fragment_8 = root_5();
									var node_10 = $.first_child(fragment_8);

									$.component(node_10, () => DatePicker.Header, ($$anchor, DatePicker_Header) => {
										DatePicker_Header($$anchor, {
											class: 'flex items-center justify-between',
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_2();
												var node_11 = $.first_child(fragment_9);

												$.component(node_11, () => DatePicker.PrevButton, ($$anchor, DatePicker_PrevButton) => {
													DatePicker_PrevButton($$anchor, {
														class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
														children: ($$anchor, $$slotProps) => {
															CaretLeft($$anchor, { class: 'size-6' });
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => DatePicker.Heading, ($$anchor, DatePicker_Heading) => {
													DatePicker_Heading($$anchor, { class: 'text-[15px] font-medium' });
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => DatePicker.NextButton, ($$anchor, DatePicker_NextButton) => {
													DatePicker_NextButton($$anchor, {
														class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
														children: ($$anchor, $$slotProps) => {
															CaretRight($$anchor, { class: 'size-6' });
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var div_2 = $.sibling(node_10, 2);

									$.each(div_2, 21, months, (month) => month.value, ($$anchor, month) => {
										var fragment_12 = $.comment();
										var node_14 = $.first_child(fragment_12);

										$.component(node_14, () => DatePicker.Grid, ($$anchor, DatePicker_Grid) => {
											DatePicker_Grid($$anchor, {
												class: 'w-full border-collapse select-none space-y-1',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_1();
													var node_15 = $.first_child(fragment_13);

													$.component(node_15, () => DatePicker.GridHead, ($$anchor, DatePicker_GridHead) => {
														DatePicker_GridHead($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_16 = $.first_child(fragment_14);

																$.component(node_16, () => DatePicker.GridRow, ($$anchor, DatePicker_GridRow) => {
																	DatePicker_GridRow($$anchor, {
																		class: 'mb-1 flex w-full justify-between',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = $.comment();
																			var node_17 = $.first_child(fragment_15);

																			$.each(node_17, 16, weekdays, (day) => day, ($$anchor, day) => {
																				var fragment_16 = $.comment();
																				var node_18 = $.first_child(fragment_16);

																				$.component(node_18, () => DatePicker.HeadCell, ($$anchor, DatePicker_HeadCell) => {
																					DatePicker_HeadCell($$anchor, {
																						class: 'text-muted-foreground font-normal! w-10 rounded-md text-xs',
																						children: ($$anchor, $$slotProps) => {
																							var div_3 = root_3();
																							var text_3 = $.only_child(div_3, true);

																							$.template_effect(($0) => $.set_text(text_3, $0), [() => day.slice(0, 2)]);
																							$.append($$anchor, div_3);
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

													$.component(node_19, () => DatePicker.GridBody, ($$anchor, DatePicker_GridBody) => {
														DatePicker_GridBody($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = $.comment();
																var node_20 = $.first_child(fragment_17);

																$.each(node_20, 16, () => $.get(month).weeks, (weekDates) => weekDates, ($$anchor, weekDates) => {
																	var fragment_18 = $.comment();
																	var node_21 = $.first_child(fragment_18);

																	$.component(node_21, () => DatePicker.GridRow, ($$anchor, DatePicker_GridRow_1) => {
																		DatePicker_GridRow_1($$anchor, {
																			class: 'flex w-full',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_19 = $.comment();
																				var node_22 = $.first_child(fragment_19);

																				$.each(node_22, 16, () => weekDates, (date) => date, ($$anchor, date) => {
																					var fragment_20 = $.comment();
																					var node_23 = $.first_child(fragment_20);

																					$.component(node_23, () => DatePicker.Cell, ($$anchor, DatePicker_Cell) => {
																						DatePicker_Cell($$anchor, {
																							get date() {
																								return date;
																							},

																							get month() {
																								return $.get(month).value;
																							},
																							class: 'p-0! relative size-10 text-center text-sm',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_21 = $.comment();
																								var node_24 = $.first_child(fragment_21);

																								$.component(node_24, () => DatePicker.Day, ($$anchor, DatePicker_Day) => {
																									DatePicker_Day($$anchor, {
																										class: 'rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal transition-all',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_22 = root_4();
																											var text_4 = $.sibling($.first_child(fragment_22));

																											$.template_effect(() => $.set_text(text_4, ` ${date.day ?? ''}`));
																											$.append($$anchor, fragment_22);
																										},
																										$$slots: { default: true }
																									});
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

																	$.append($$anchor, fragment_18);
																});

																$.append($$anchor, fragment_17);
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

									$.reset(div_2);
									$.append($$anchor, fragment_8);
								};

								$.component(node_9, () => DatePicker.Calendar, ($$anchor, DatePicker_Calendar) => {
									DatePicker_Calendar($$anchor, {
										class: 'border-dark-10 bg-background-alt shadow-popover rounded-[15px] border p-[22px]',
										children,
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}