import * as $ from 'svelte/internal/server';
import { DateRangePicker } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";

export default function Date_range_picker_demo($$renderer) {
	if (DateRangePicker.Root) {
		$$renderer.push('<!--[-->');

		DateRangePicker.Root($$renderer, {
			weekdayFormat: 'short',
			fixedWeeks: true,
			class: 'flex w-full max-w-[340px] flex-col gap-1.5',
			children: ($$renderer) => {
				if (DateRangePicker.Label) {
					$$renderer.push('<!--[-->');

					DateRangePicker.Label($$renderer, {
						class: 'block select-none text-sm font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Rental Days`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <div class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover flex w-full select-none items-center border px-2 py-3 text-sm tracking-[0.01em]"><!--[-->`);

				const each_array = $.ensure_array_like(["start", "end"]);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let type = each_array[$$index_1];

					{
						function children($$renderer, { segments }) {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(segments);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let { part, value } = each_array_1[i];

								$$renderer.push(`<div class="inline-block select-none">`);

								if (part === "literal") {
									$$renderer.push('<!--[0-->');

									if (DateRangePicker.Segment) {
										$$renderer.push('<!--[-->');

										DateRangePicker.Segment($$renderer, {
											part,
											class: 'text-muted-foreground p-1',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(value)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');

									if (DateRangePicker.Segment) {
										$$renderer.push('<!--[-->');

										DateRangePicker.Segment($$renderer, {
											part,
											class: 'rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(value)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]--></div>`);
							}

							$$renderer.push(`<!--]-->`);
						}

						if (DateRangePicker.Input) {
							$$renderer.push('<!--[-->');
							DateRangePicker.Input($$renderer, { type, children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(` `);

					if (type === "start") {
						$$renderer.push(`<!--[0--><div aria-hidden="true" class="text-muted-foreground px-1">–⁠⁠⁠⁠⁠</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--> `);

				if (DateRangePicker.Trigger) {
					$$renderer.push('<!--[-->');

					DateRangePicker.Trigger($$renderer, {
						class: 'text-foreground/60 hover:bg-muted active:bg-dark-10 ml-auto inline-flex size-8 items-center justify-center rounded-[5px] transition-all',
						children: ($$renderer) => {
							CalendarBlank($$renderer, { class: 'size-6' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> `);

				if (DateRangePicker.Content) {
					$$renderer.push('<!--[-->');

					DateRangePicker.Content($$renderer, {
						sideOffset: 6,
						class: 'z-50',
						children: ($$renderer) => {
							{
								function children($$renderer, { months, weekdays }) {
									if (DateRangePicker.Header) {
										$$renderer.push('<!--[-->');

										DateRangePicker.Header($$renderer, {
											class: 'flex items-center justify-between',
											children: ($$renderer) => {
												if (DateRangePicker.PrevButton) {
													$$renderer.push('<!--[-->');

													DateRangePicker.PrevButton($$renderer, {
														class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
														children: ($$renderer) => {
															CaretLeft($$renderer, { class: 'size-6' });
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DateRangePicker.Heading) {
													$$renderer.push('<!--[-->');
													DateRangePicker.Heading($$renderer, { class: 'text-[15px] font-medium' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DateRangePicker.NextButton) {
													$$renderer.push('<!--[-->');

													DateRangePicker.NextButton($$renderer, {
														class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
														children: ($$renderer) => {
															CaretRight($$renderer, { class: 'size-6' });
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"><!--[-->`);

									const each_array_2 = $.ensure_array_like(months);

									for (let $$index_5 = 0, $$length = each_array_2.length; $$index_5 < $$length; $$index_5++) {
										let month = each_array_2[$$index_5];

										if (DateRangePicker.Grid) {
											$$renderer.push('<!--[-->');

											DateRangePicker.Grid($$renderer, {
												class: 'w-full border-collapse select-none space-y-1',
												children: ($$renderer) => {
													if (DateRangePicker.GridHead) {
														$$renderer.push('<!--[-->');

														DateRangePicker.GridHead($$renderer, {
															children: ($$renderer) => {
																if (DateRangePicker.GridRow) {
																	$$renderer.push('<!--[-->');

																	DateRangePicker.GridRow($$renderer, {
																		class: 'mb-1 flex w-full justify-between',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_3 = $.ensure_array_like(weekdays);

																			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
																				let day = each_array_3[$$index_2];

																				if (DateRangePicker.HeadCell) {
																					$$renderer.push('<!--[-->');

																					DateRangePicker.HeadCell($$renderer, {
																						class: 'text-muted-foreground font-normal! w-10 rounded-md text-xs',
																						children: ($$renderer) => {
																							$$renderer.push(`<div>${$.escape(day.slice(0, 2))}</div>`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}

																			$$renderer.push(`<!--]-->`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DateRangePicker.GridBody) {
														$$renderer.push('<!--[-->');

														DateRangePicker.GridBody($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_4 = $.ensure_array_like(month.weeks);

																for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																	let weekDates = each_array_4[$$index_4];

																	if (DateRangePicker.GridRow) {
																		$$renderer.push('<!--[-->');

																		DateRangePicker.GridRow($$renderer, {
																			class: 'flex w-full',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_5 = $.ensure_array_like(weekDates);

																				for (let $$index_3 = 0, $$length = each_array_5.length; $$index_3 < $$length; $$index_3++) {
																					let date = each_array_5[$$index_3];

																					if (DateRangePicker.Cell) {
																						$$renderer.push('<!--[-->');

																						DateRangePicker.Cell($$renderer, {
																							date,
																							month: month.value,
																							class: 'p-0! relative m-0 size-10 overflow-visible text-center text-sm focus-within:relative focus-within:z-20',
																							children: ($$renderer) => {
																								if (DateRangePicker.Day) {
																									$$renderer.push('<!--[-->');

																									DateRangePicker.Day($$renderer, {
																										class: 'rounded-9px text-foreground hover:border-foreground focus-visible:ring-foreground! data-selection-end:rounded-9px data-selection-start:rounded-9px data-highlighted:bg-muted data-selected:bg-muted data-selection-end:bg-foreground data-selection-start:bg-foreground data-disabled:text-foreground/30 data-selected:text-foreground data-selection-end:text-background data-selection-start:text-background data-unavailable:text-muted-foreground data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:border-foreground data-disabled:pointer-events-none data-highlighted:rounded-none  data-outside-month:pointer-events-none data-selected:font-medium data-selection-end:font-medium data-selection-start:font-medium data-selection-start:focus-visible:ring-2 data-selection-start:focus-visible:ring-offset-2! data-unavailable:line-through data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-0! data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-offset-0! group relative inline-flex size-10 items-center justify-center overflow-visible whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal transition-all',
																										children: ($$renderer) => {
																											$$renderer.push(`<div class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full transition-all"></div> ${$.escape(date.day)}`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(`<!--]-->`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--></div>`);
								}

								if (DateRangePicker.Calendar) {
									$$renderer.push('<!--[-->');

									DateRangePicker.Calendar($$renderer, {
										class: 'rounded-15px border-dark-10 bg-background-alt shadow-popover mt-6 border p-[22px]',
										children,
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}