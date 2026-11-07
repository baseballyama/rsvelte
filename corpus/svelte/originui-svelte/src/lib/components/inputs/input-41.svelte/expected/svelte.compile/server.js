import * as $ from 'svelte/internal/server';
import Label from '../ui/label.svelte';
import { useLocale } from '$lib/hooks/use-locale.svelte';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { cn } from '$lib/utils';
import { DatePicker } from 'bits-ui';

export default function Input_41($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = undefined;
		let locale = useLocale();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DatePicker.Root) {
				$$renderer.push('<!--[-->');

				DatePicker.Root($$renderer, {
					locale: locale.locale,
					weekdayFormat: 'short',
					fixedWeeks: true,
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="*:not-first:mt-2">`);

						Label($$renderer, {
							class: 'text-foreground text-sm font-medium',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Date picker`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="flex"><div class="bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 inline-flex h-9 w-full items-center overflow-hidden rounded-lg border px-3 py-2 pe-9 text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden disabled:opacity-50">`);

						{
							function children($$renderer, { segments }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(segments);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let { part, value } = each_array[i];

									if (DatePicker.Segment) {
										$$renderer.push('<!--[-->');

										DatePicker.Segment($$renderer, {
											part,
											class: [
												'text-foreground focus:bg-accent data-invalid:focused:bg-destructive focused:aria-[valuetext=Empty]:text-foreground focused:text-foreground data-invalid:aria-[valuetext=Empty]:text-destructive data-invalid:text-destructive aria-[valuetext=Empty]:text-muted-foreground/70 data-invalid:focused:text-white data-invalid:focused:aria-[valuetext=Empty]:text-white inline rounded p-0.5 caret-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
												'data-[segment=literal]:text-muted-foreground/70 data-[segment=literal]:px-0'
											],

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

								$$renderer.push(`<!--]-->`);
							}

							if (DatePicker.Input) {
								$$renderer.push('<!--[-->');
								DatePicker.Input($$renderer, { children, $$slots: { default: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`</div> `);

						if (DatePicker.Trigger) {
							$$renderer.push('<!--[-->');

							DatePicker.Trigger($$renderer, {
								class: 'text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]',
								children: ($$renderer) => {
									CalendarIcon($$renderer, { size: 16 });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> `);

						if (DatePicker.Content) {
							$$renderer.push('<!--[-->');

							DatePicker.Content($$renderer, {
								sideOffset: 6,
								class: 'border-input bg-background text-foreground z-50 rounded-lg border shadow-lg shadow-black/[.04] outline-hidden',
								children: ($$renderer) => {
									{
										function children($$renderer, { months, weekdays }) {
											if (DatePicker.Header) {
												$$renderer.push('<!--[-->');

												DatePicker.Header($$renderer, {
													class: 'flex w-full items-center gap-1 pb-1',
													children: ($$renderer) => {
														if (DatePicker.PrevButton) {
															$$renderer.push('<!--[-->');

															DatePicker.PrevButton($$renderer, {
																class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
																children: ($$renderer) => {
																	ChevronLeft($$renderer, { size: 16 });
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
															DatePicker.Heading($$renderer, { class: 'grow text-center text-sm font-medium' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DatePicker.NextButton) {
															$$renderer.push('<!--[-->');

															DatePicker.NextButton($$renderer, {
																class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
																children: ($$renderer) => {
																	ChevronRight($$renderer, { size: 16 });
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

											$$renderer.push(` <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4"><!--[-->`);

											const each_array_1 = $.ensure_array_like(months);

											for (let $$index_4 = 0, $$length = each_array_1.length; $$index_4 < $$length; $$index_4++) {
												let month = each_array_1[$$index_4];

												if (DatePicker.Grid) {
													$$renderer.push('<!--[-->');

													DatePicker.Grid($$renderer, {
														class: 'w-fit border-collapse space-y-1 select-none',
														children: ($$renderer) => {
															if (DatePicker.GridHead) {
																$$renderer.push('<!--[-->');

																DatePicker.GridHead($$renderer, {
																	children: ($$renderer) => {
																		if (DatePicker.GridRow) {
																			$$renderer.push('<!--[-->');

																			DatePicker.GridRow($$renderer, {
																				class: 'flex w-full justify-between',
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_2 = $.ensure_array_like(weekdays);

																					for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																						let day = each_array_2[$$index_1];

																						if (DatePicker.HeadCell) {
																							$$renderer.push('<!--[-->');

																							DatePicker.HeadCell($$renderer, {
																								class: 'text-muted-foreground/80 size-9 rounded-lg p-0 text-xs font-medium',
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
																	class: '[&_td]:px-0',
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
																									class: 'relative size-10 p-0! text-center text-sm',
																									children: ($$renderer) => {
																										if (DatePicker.Day) {
																											$$renderer.push('<!--[-->');

																											DatePicker.Day($$renderer, {
																												class: cn('text-foreground ring-offset-background relative flex size-9 items-center justify-center rounded-lg border border-transparent p-0 text-sm font-normal whitespace-nowrap [transition-property:border-radius,box-shadow] duration-150', 'disabled:pointer-events-none data-outside-month:pointer-events-none', 'data-highlighted:bg-accent data-selected:bg-accent', 'data-selection-end:bg-primary data-selection-start:bg-primary', 'data-selection-end:text-primary-foreground data-selection-start:text-primary-foreground', 'data-highlighted:rounded-none data-selection-end:rounded-e-lg data-selection-start:rounded-s-lg', 'focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden'),
																												children: ($$renderer) => {
																													$$renderer.push(`<div class="bg-primary data-selected:bg-background absolute start-1/2 bottom-1 hidden size-[3px] -translate-x-1/2 rounded-full transition-all group-data-today:block"></div> ${$.escape(date.day)}`);
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
											DatePicker.Calendar($$renderer, { class: 'w-fit p-2', children, $$slots: { default: true } });
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}