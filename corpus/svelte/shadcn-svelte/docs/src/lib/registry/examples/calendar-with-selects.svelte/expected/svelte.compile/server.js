import * as $ from 'svelte/internal/server';
import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
import { Calendar as CalendarPrimitive } from "bits-ui";
import * as Calendar from "$lib/registry/ui/calendar/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { cn } from "$lib/utils.js";

export default function Calendar_with_selects($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = void 0;
		let placeholder = void 0;
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

		const defaultYear = $.derived(() => placeholder
			? { value: placeholder.year, label: String(placeholder.year) }
			: undefined);

		const defaultMonth = $.derived(() => placeholder
			? {
				value: placeholder.month,
				label: monthFmt.format(placeholder.toDate(getLocalTimeZone()))
			}
			: undefined);

		const monthLabel = $.derived(() => monthOptions.find((m) => m.value === defaultMonth()?.value)?.label ?? "Select a month");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { months, weekdays }) {
					if (Calendar.Header) {
						$$renderer.push('<!--[-->');

						Calendar.Header($$renderer, {
							class: 'flex w-full items-center justify-between gap-2',
							children: ($$renderer) => {
								if (Select.Root) {
									$$renderer.push('<!--[-->');

									Select.Root($$renderer, {
										type: 'single',
										value: `${defaultMonth()?.value}`,
										onValueChange: (v) => {
											if (!placeholder) return;
											if (v === `${placeholder.month}`) return;

											placeholder = placeholder.set({ month: Number.parseInt(v) });
										},

										children: ($$renderer) => {
											if (Select.Trigger) {
												$$renderer.push('<!--[-->');

												Select.Trigger($$renderer, {
													'aria-label': 'Select month',
													class: 'w-[60%]',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(monthLabel())}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Select.Content) {
												$$renderer.push('<!--[-->');

												Select.Content($$renderer, {
													class: 'max-h-[200px] overflow-y-auto',
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(monthOptions);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let { value, label } = each_array[$$index];

															if (Select.Item) {
																$$renderer.push('<!--[-->');
																Select.Item($$renderer, { value: `${value}`, label });
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

								if (Select.Root) {
									$$renderer.push('<!--[-->');

									Select.Root($$renderer, {
										type: 'single',
										value: `${defaultYear()?.value}`,
										onValueChange: (v) => {
											if (!v || !placeholder) return;
											if (v === `${placeholder?.year}`) return;

											placeholder = placeholder.set({ year: Number.parseInt(v) });
										},

										children: ($$renderer) => {
											if (Select.Trigger) {
												$$renderer.push('<!--[-->');

												Select.Trigger($$renderer, {
													'aria-label': 'Select year',
													class: 'w-[40%]',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(defaultYear()?.label ?? "Select year")}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Select.Content) {
												$$renderer.push('<!--[-->');

												Select.Content($$renderer, {
													class: 'max-h-[200px] overflow-y-auto',
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_1 = $.ensure_array_like(yearOptions);

														for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
															let { value, label } = each_array_1[$$index_1];

															if (Select.Item) {
																$$renderer.push('<!--[-->');
																Select.Item($$renderer, { value: `${value}`, label });
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Calendar.Months) {
						$$renderer.push('<!--[-->');

						Calendar.Months($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_2 = $.ensure_array_like(months);

								for (let $$index_5 = 0, $$length = each_array_2.length; $$index_5 < $$length; $$index_5++) {
									let month = each_array_2[$$index_5];

									if (Calendar.Grid) {
										$$renderer.push('<!--[-->');

										Calendar.Grid($$renderer, {
											children: ($$renderer) => {
												if (Calendar.GridHead) {
													$$renderer.push('<!--[-->');

													Calendar.GridHead($$renderer, {
														children: ($$renderer) => {
															if (Calendar.GridRow) {
																$$renderer.push('<!--[-->');

																Calendar.GridRow($$renderer, {
																	class: 'flex',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_3 = $.ensure_array_like(weekdays);

																		for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
																			let weekday = each_array_3[$$index_2];

																			if (Calendar.HeadCell) {
																				$$renderer.push('<!--[-->');

																				Calendar.HeadCell($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(weekday.slice(0, 2))}`);
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

												if (Calendar.GridBody) {
													$$renderer.push('<!--[-->');

													Calendar.GridBody($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_4 = $.ensure_array_like(month.weeks);

															for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																let weekDates = each_array_4[$$index_4];

																if (Calendar.GridRow) {
																	$$renderer.push('<!--[-->');

																	Calendar.GridRow($$renderer, {
																		class: 'mt-2 w-full',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_5 = $.ensure_array_like(weekDates);

																			for (let $$index_3 = 0, $$length = each_array_5.length; $$index_3 < $$length; $$index_3++) {
																				let date = each_array_5[$$index_3];

																				if (Calendar.Cell) {
																					$$renderer.push('<!--[-->');

																					Calendar.Cell($$renderer, {
																						class: 'select-none',
																						date,
																						month: month.value,
																						children: ($$renderer) => {
																							if (Calendar.Day) {
																								$$renderer.push('<!--[-->');
																								Calendar.Day($$renderer, {});
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

				if (CalendarPrimitive.Root) {
					$$renderer.push('<!--[-->');

					CalendarPrimitive.Root($$renderer, {
						type: 'single',
						weekdayFormat: 'short',
						class: cn("rounded-md border p-3"),
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get placeholder() {
							return placeholder;
						},

						set placeholder($$value) {
							placeholder = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}