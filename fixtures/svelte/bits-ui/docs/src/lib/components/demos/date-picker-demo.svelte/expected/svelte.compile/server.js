import * as $ from 'svelte/internal/server';
import { DatePicker } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";

export default function Date_picker_demo($$renderer) {
	if (DatePicker.Root) {
		$$renderer.push('<!--[-->');

		DatePicker.Root($$renderer, {
			weekdayFormat: 'short',
			fixedWeeks: true,
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex w-full max-w-[232px] flex-col gap-1.5">`);

				if (DatePicker.Label) {
					$$renderer.push('<!--[-->');

					DatePicker.Label($$renderer, {
						class: 'block select-none text-sm font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Birthday`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				{
					function children($$renderer, { segments }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(segments);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let { part, value } = each_array[i];

							$$renderer.push(`<div class="inline-block select-none">`);

							if (part === "literal") {
								$$renderer.push('<!--[0-->');

								if (DatePicker.Segment) {
									$$renderer.push('<!--[-->');

									DatePicker.Segment($$renderer, {
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

								if (DatePicker.Segment) {
									$$renderer.push('<!--[-->');

									DatePicker.Segment($$renderer, {
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

						$$renderer.push(`<!--]--> `);

						if (DatePicker.Trigger) {
							$$renderer.push('<!--[-->');

							DatePicker.Trigger($$renderer, {
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
					}

					if (DatePicker.Input) {
						$$renderer.push('<!--[-->');

						DatePicker.Input($$renderer, {
							class: 'h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover flex w-full max-w-[232px] select-none items-center border px-2 py-3 text-sm tracking-[0.01em]',
							children,
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(` `);

				if (DatePicker.Content) {
					$$renderer.push('<!--[-->');

					DatePicker.Content($$renderer, {
						sideOffset: 6,
						class: 'z-50',
						children: ($$renderer) => {
							{
								function children($$renderer, { months, weekdays }) {
									if (DatePicker.Header) {
										$$renderer.push('<!--[-->');

										DatePicker.Header($$renderer, {
											class: 'flex items-center justify-between',
											children: ($$renderer) => {
												if (DatePicker.PrevButton) {
													$$renderer.push('<!--[-->');

													DatePicker.PrevButton($$renderer, {
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

												if (DatePicker.Heading) {
													$$renderer.push('<!--[-->');
													DatePicker.Heading($$renderer, { class: 'text-[15px] font-medium' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DatePicker.NextButton) {
													$$renderer.push('<!--[-->');

													DatePicker.NextButton($$renderer, {
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

									const each_array_1 = $.ensure_array_like(months);

									for (let $$index_4 = 0, $$length = each_array_1.length; $$index_4 < $$length; $$index_4++) {
										let month = each_array_1[$$index_4];

										if (DatePicker.Grid) {
											$$renderer.push('<!--[-->');

											DatePicker.Grid($$renderer, {
												class: 'w-full border-collapse select-none space-y-1',
												children: ($$renderer) => {
													if (DatePicker.GridHead) {
														$$renderer.push('<!--[-->');

														DatePicker.GridHead($$renderer, {
															children: ($$renderer) => {
																if (DatePicker.GridRow) {
																	$$renderer.push('<!--[-->');

																	DatePicker.GridRow($$renderer, {
																		class: 'mb-1 flex w-full justify-between',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_2 = $.ensure_array_like(weekdays);

																			for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																				let day = each_array_2[$$index_1];

																				if (DatePicker.HeadCell) {
																					$$renderer.push('<!--[-->');

																					DatePicker.HeadCell($$renderer, {
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

													if (DatePicker.GridBody) {
														$$renderer.push('<!--[-->');

														DatePicker.GridBody($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_3 = $.ensure_array_like(month.weeks);

																for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																	let weekDates = each_array_3[$$index_3];

																	if (DatePicker.GridRow) {
																		$$renderer.push('<!--[-->');

																		DatePicker.GridRow($$renderer, {
																			class: 'flex w-full',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_4 = $.ensure_array_like(weekDates);

																				for (let $$index_2 = 0, $$length = each_array_4.length; $$index_2 < $$length; $$index_2++) {
																					let date = each_array_4[$$index_2];

																					if (DatePicker.Cell) {
																						$$renderer.push('<!--[-->');

																						DatePicker.Cell($$renderer, {
																							date,
																							month: month.value,
																							class: 'p-0! relative size-10 text-center text-sm',
																							children: ($$renderer) => {
																								if (DatePicker.Day) {
																									$$renderer.push('<!--[-->');

																									DatePicker.Day($$renderer, {
																										class: 'rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal transition-all',
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

								if (DatePicker.Calendar) {
									$$renderer.push('<!--[-->');

									DatePicker.Calendar($$renderer, {
										class: 'border-dark-10 bg-background-alt shadow-popover rounded-[15px] border p-[22px]',
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

				$$renderer.push(`</div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}