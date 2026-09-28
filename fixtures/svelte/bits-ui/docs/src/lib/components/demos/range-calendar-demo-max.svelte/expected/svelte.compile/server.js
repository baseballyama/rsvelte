import * as $ from 'svelte/internal/server';
import { RangeCalendar } from "bits-ui";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import { cn } from "$lib/utils/styles.js";

export default function Range_calendar_demo_max($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { months, weekdays }) {
					if (RangeCalendar.Header) {
						$$renderer.push('<!--[-->');

						RangeCalendar.Header($$renderer, {
							class: 'flex items-center justify-between',
							children: ($$renderer) => {
								if (RangeCalendar.PrevButton) {
									$$renderer.push('<!--[-->');

									RangeCalendar.PrevButton($$renderer, {
										class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98]',
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

								if (RangeCalendar.Heading) {
									$$renderer.push('<!--[-->');
									RangeCalendar.Heading($$renderer, { class: 'text-[15px] font-medium' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (RangeCalendar.NextButton) {
									$$renderer.push('<!--[-->');

									RangeCalendar.NextButton($$renderer, {
										class: 'rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98]',
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

					for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
						let month = each_array[$$index_3];

						if (RangeCalendar.Grid) {
							$$renderer.push('<!--[-->');

							RangeCalendar.Grid($$renderer, {
								class: 'w-full border-collapse select-none space-y-1',
								children: ($$renderer) => {
									if (RangeCalendar.GridHead) {
										$$renderer.push('<!--[-->');

										RangeCalendar.GridHead($$renderer, {
											children: ($$renderer) => {
												if (RangeCalendar.GridRow) {
													$$renderer.push('<!--[-->');

													RangeCalendar.GridRow($$renderer, {
														class: 'mb-1 flex w-full justify-between',
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(weekdays);

															for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																let day = each_array_1[$$index];

																if (RangeCalendar.HeadCell) {
																	$$renderer.push('<!--[-->');

																	RangeCalendar.HeadCell($$renderer, {
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

									if (RangeCalendar.GridBody) {
										$$renderer.push('<!--[-->');

										RangeCalendar.GridBody($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like(month.weeks);

												for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
													let weekDates = each_array_2[i];

													if (RangeCalendar.GridRow) {
														$$renderer.push('<!--[-->');

														RangeCalendar.GridRow($$renderer, {
															class: 'flex w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_3 = $.ensure_array_like(weekDates);

																for (let d = 0, $$length = each_array_3.length; d < $$length; d++) {
																	let date = each_array_3[d];

																	if (RangeCalendar.Cell) {
																		$$renderer.push('<!--[-->');

																		RangeCalendar.Cell($$renderer, {
																			date,
																			month: month.value,
																			class: 'p-0! relative m-0 size-10 text-center text-sm focus-within:z-20',
																			children: ($$renderer) => {
																				if (RangeCalendar.Day) {
																					$$renderer.push('<!--[-->');

																					RangeCalendar.Day($$renderer, {
																						class: cn("rounded-9px text-foreground hover:border-foreground focus-visible:ring-foreground! data-selection-end:rounded-9px data-selection-start:rounded-9px data-highlighted:bg-muted data-selected:bg-muted data-selection-end:bg-foreground data-selection-start:bg-foreground data-disabled:text-foreground/30 data-selected:text-foreground data-selection-end:text-background data-selection-start:text-background data-unavailable:text-muted-foreground data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:border-foreground data-disabled:pointer-events-none data-highlighted:rounded-none data-outside-month:pointer-events-none data-selected:font-medium data-selection-end:font-medium data-selection-start:font-medium data-selection-start:focus-visible:ring-2 data-selection-start:focus-visible:ring-offset-2! data-unavailable:line-through data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-0! data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:ring-offset-0! group relative inline-flex size-10 items-center justify-center overflow-visible whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal"),
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

				if (RangeCalendar.Root) {
					$$renderer.push('<!--[-->');

					RangeCalendar.Root($$renderer, {
						class: 'rounded-15px border-dark-10 bg-background-alt shadow-card mt-6 border p-[22px]',
						weekdayFormat: 'short',
						fixedWeeks: true,
						maxDays: 7,
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
		$.bind_props($$props, { value });
	});
}