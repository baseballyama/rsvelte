import * as $ from 'svelte/internal/server';
import { Calendar } from "bits-ui";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import { getLocalTimeZone, today } from "@internationalized/date";

export default function Calendar_demo_max($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = [today(getLocalTimeZone())];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { months, weekdays }) {
					if (Calendar.Header) {
						$$renderer.push('<!--[-->');

						Calendar.Header($$renderer, {
							class: 'flex items-center justify-between',
							children: ($$renderer) => {
								if (Calendar.PrevButton) {
									$$renderer.push('<!--[-->');

									Calendar.PrevButton($$renderer, {
										class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98] active:transition-all',
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

								if (Calendar.Heading) {
									$$renderer.push('<!--[-->');
									Calendar.Heading($$renderer, { class: 'text-[15px] font-medium' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Calendar.NextButton) {
									$$renderer.push('<!--[-->');

									Calendar.NextButton($$renderer, {
										class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98] active:transition-all',
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

					const each_array = $.ensure_array_like(months);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let month = each_array[i];

						if (Calendar.Grid) {
							$$renderer.push('<!--[-->');

							Calendar.Grid($$renderer, {
								class: 'w-full border-collapse select-none space-y-1',
								children: ($$renderer) => {
									if (Calendar.GridHead) {
										$$renderer.push('<!--[-->');

										Calendar.GridHead($$renderer, {
											children: ($$renderer) => {
												if (Calendar.GridRow) {
													$$renderer.push('<!--[-->');

													Calendar.GridRow($$renderer, {
														class: 'mb-1 flex w-full justify-between',
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(weekdays);

															for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																let day = each_array_1[i];

																if (Calendar.HeadCell) {
																	$$renderer.push('<!--[-->');

																	Calendar.HeadCell($$renderer, {
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

									if (Calendar.GridBody) {
										$$renderer.push('<!--[-->');

										Calendar.GridBody($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like(month.weeks);

												for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
													let weekDates = each_array_2[i];

													if (Calendar.GridRow) {
														$$renderer.push('<!--[-->');

														Calendar.GridRow($$renderer, {
															class: 'flex w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_3 = $.ensure_array_like(weekDates);

																for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
																	let date = each_array_3[i];

																	if (Calendar.Cell) {
																		$$renderer.push('<!--[-->');

																		Calendar.Cell($$renderer, {
																			date,
																			month: month.value,
																			class: 'p-0! relative size-10 text-center text-sm',
																			children: ($$renderer) => {
																				if (Calendar.Day) {
																					$$renderer.push('<!--[-->');

																					Calendar.Day($$renderer, {
																						class: 'rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal',
																						children: ($$renderer) => {
																							$$renderer.push(`<div class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full"></div> ${$.escape(date.day)}`);
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

				if (Calendar.Root) {
					$$renderer.push('<!--[-->');

					Calendar.Root($$renderer, {
						class: 'border-dark-10 bg-background-alt shadow-card mt-6 rounded-[15px] border p-[22px]',
						weekdayFormat: 'short',
						fixedWeeks: true,
						type: 'multiple',
						maxDays: 3,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
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