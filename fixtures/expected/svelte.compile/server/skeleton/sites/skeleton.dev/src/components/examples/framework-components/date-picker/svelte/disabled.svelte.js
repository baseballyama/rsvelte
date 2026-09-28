import * as $ from 'svelte/internal/server';
import { DatePicker, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Disabled($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DatePicker($$renderer, {
			disabled: true,
			children: ($$renderer) => {
				if (DatePicker.Label) {
					$$renderer.push('<!--[-->');

					DatePicker.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Choose Date`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (DatePicker.Control) {
					$$renderer.push('<!--[-->');

					DatePicker.Control($$renderer, {
						children: ($$renderer) => {
							if (DatePicker.Input) {
								$$renderer.push('<!--[-->');
								DatePicker.Input($$renderer, { placeholder: 'mm/dd/yyyy' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (DatePicker.Trigger) {
								$$renderer.push('<!--[-->');
								DatePicker.Trigger($$renderer, {});
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

				Portal($$renderer, {
					children: ($$renderer) => {
						if (DatePicker.Positioner) {
							$$renderer.push('<!--[-->');

							DatePicker.Positioner($$renderer, {
								children: ($$renderer) => {
									if (DatePicker.Content) {
										$$renderer.push('<!--[-->');

										DatePicker.Content($$renderer, {
											children: ($$renderer) => {
												if (DatePicker.View) {
													$$renderer.push('<!--[-->');

													DatePicker.View($$renderer, {
														view: 'day',
														children: ($$renderer) => {
															{
																function children($$renderer, datePicker) {
																	if (DatePicker.ViewControl) {
																		$$renderer.push('<!--[-->');

																		DatePicker.ViewControl($$renderer, {
																			children: ($$renderer) => {
																				if (DatePicker.PrevTrigger) {
																					$$renderer.push('<!--[-->');
																					DatePicker.PrevTrigger($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (DatePicker.ViewTrigger) {
																					$$renderer.push('<!--[-->');

																					DatePicker.ViewTrigger($$renderer, {
																						children: ($$renderer) => {
																							if (DatePicker.RangeText) {
																								$$renderer.push('<!--[-->');
																								DatePicker.RangeText($$renderer, {});
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

																				if (DatePicker.NextTrigger) {
																					$$renderer.push('<!--[-->');
																					DatePicker.NextTrigger($$renderer, {});
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

																	if (DatePicker.Table) {
																		$$renderer.push('<!--[-->');

																		DatePicker.Table($$renderer, {
																			children: ($$renderer) => {
																				if (DatePicker.TableHead) {
																					$$renderer.push('<!--[-->');

																					DatePicker.TableHead($$renderer, {
																						children: ($$renderer) => {
																							if (DatePicker.TableRow) {
																								$$renderer.push('<!--[-->');

																								DatePicker.TableRow($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!--[-->`);

																										const each_array = $.ensure_array_like(datePicker().weekDays);

																										for (let id = 0, $$length = each_array.length; id < $$length; id++) {
																											let weekDay = each_array[id];

																											if (DatePicker.TableHeader) {
																												$$renderer.push('<!--[-->');

																												DatePicker.TableHeader($$renderer, {
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->${$.escape(weekDay.short)}`);
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

																				if (DatePicker.TableBody) {
																					$$renderer.push('<!--[-->');

																					DatePicker.TableBody($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!--[-->`);

																							const each_array_1 = $.ensure_array_like(datePicker().weeks);

																							for (let id = 0, $$length = each_array_1.length; id < $$length; id++) {
																								let week = each_array_1[id];

																								if (DatePicker.TableRow) {
																									$$renderer.push('<!--[-->');

																									DatePicker.TableRow($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!--[-->`);

																											const each_array_2 = $.ensure_array_like(week);

																											for (let id = 0, $$length = each_array_2.length; id < $$length; id++) {
																												let day = each_array_2[id];

																												if (DatePicker.TableCell) {
																													$$renderer.push('<!--[-->');

																													DatePicker.TableCell($$renderer, {
																														value: day,
																														children: ($$renderer) => {
																															if (DatePicker.TableCellTrigger) {
																																$$renderer.push('<!--[-->');

																																DatePicker.TableCellTrigger($$renderer, {
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->${$.escape(day.day)}`);
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

																if (DatePicker.Context) {
																	$$renderer.push('<!--[-->');
																	DatePicker.Context($$renderer, { children, $$slots: { default: true } });
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

												$$renderer.push(` `);

												if (DatePicker.View) {
													$$renderer.push('<!--[-->');

													DatePicker.View($$renderer, {
														view: 'month',
														children: ($$renderer) => {
															{
																function children($$renderer, datePicker) {
																	if (DatePicker.ViewControl) {
																		$$renderer.push('<!--[-->');

																		DatePicker.ViewControl($$renderer, {
																			children: ($$renderer) => {
																				if (DatePicker.PrevTrigger) {
																					$$renderer.push('<!--[-->');
																					DatePicker.PrevTrigger($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (DatePicker.ViewTrigger) {
																					$$renderer.push('<!--[-->');

																					DatePicker.ViewTrigger($$renderer, {
																						children: ($$renderer) => {
																							if (DatePicker.RangeText) {
																								$$renderer.push('<!--[-->');
																								DatePicker.RangeText($$renderer, {});
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

																				if (DatePicker.NextTrigger) {
																					$$renderer.push('<!--[-->');
																					DatePicker.NextTrigger($$renderer, {});
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

																	if (DatePicker.Table) {
																		$$renderer.push('<!--[-->');

																		DatePicker.Table($$renderer, {
																			children: ($$renderer) => {
																				if (DatePicker.TableBody) {
																					$$renderer.push('<!--[-->');

																					DatePicker.TableBody($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!--[-->`);

																							const each_array_3 = $.ensure_array_like(datePicker().getMonthsGrid({ columns: 4, format: 'short' }));

																							for (let id = 0, $$length = each_array_3.length; id < $$length; id++) {
																								let months = each_array_3[id];

																								if (DatePicker.TableRow) {
																									$$renderer.push('<!--[-->');

																									DatePicker.TableRow($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!--[-->`);

																											const each_array_4 = $.ensure_array_like(months);

																											for (let id = 0, $$length = each_array_4.length; id < $$length; id++) {
																												let month = each_array_4[id];

																												if (DatePicker.TableCell) {
																													$$renderer.push('<!--[-->');

																													DatePicker.TableCell($$renderer, {
																														value: month.value,
																														children: ($$renderer) => {
																															if (DatePicker.TableCellTrigger) {
																																$$renderer.push('<!--[-->');

																																DatePicker.TableCellTrigger($$renderer, {
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->${$.escape(month.label)}`);
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

																if (DatePicker.Context) {
																	$$renderer.push('<!--[-->');
																	DatePicker.Context($$renderer, { children, $$slots: { default: true } });
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

												$$renderer.push(` `);

												if (DatePicker.View) {
													$$renderer.push('<!--[-->');

													DatePicker.View($$renderer, {
														view: 'year',
														children: ($$renderer) => {
															{
																function children($$renderer, datePicker) {
																	if (DatePicker.ViewControl) {
																		$$renderer.push('<!--[-->');

																		DatePicker.ViewControl($$renderer, {
																			children: ($$renderer) => {
																				if (DatePicker.PrevTrigger) {
																					$$renderer.push('<!--[-->');
																					DatePicker.PrevTrigger($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (DatePicker.ViewTrigger) {
																					$$renderer.push('<!--[-->');

																					DatePicker.ViewTrigger($$renderer, {
																						children: ($$renderer) => {
																							if (DatePicker.RangeText) {
																								$$renderer.push('<!--[-->');
																								DatePicker.RangeText($$renderer, {});
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

																				if (DatePicker.NextTrigger) {
																					$$renderer.push('<!--[-->');
																					DatePicker.NextTrigger($$renderer, {});
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

																	if (DatePicker.Table) {
																		$$renderer.push('<!--[-->');

																		DatePicker.Table($$renderer, {
																			children: ($$renderer) => {
																				if (DatePicker.TableBody) {
																					$$renderer.push('<!--[-->');

																					DatePicker.TableBody($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!--[-->`);

																							const each_array_5 = $.ensure_array_like(datePicker().getYearsGrid({ columns: 4 }));

																							for (let id = 0, $$length = each_array_5.length; id < $$length; id++) {
																								let years = each_array_5[id];

																								if (DatePicker.TableRow) {
																									$$renderer.push('<!--[-->');

																									DatePicker.TableRow($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!--[-->`);

																											const each_array_6 = $.ensure_array_like(years);

																											for (let id = 0, $$length = each_array_6.length; id < $$length; id++) {
																												let year = each_array_6[id];

																												if (DatePicker.TableCell) {
																													$$renderer.push('<!--[-->');

																													DatePicker.TableCell($$renderer, {
																														value: year.value,
																														children: ($$renderer) => {
																															if (DatePicker.TableCellTrigger) {
																																$$renderer.push('<!--[-->');

																																DatePicker.TableCellTrigger($$renderer, {
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->${$.escape(year.label)}`);
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

																if (DatePicker.Context) {
																	$$renderer.push('<!--[-->');
																	DatePicker.Context($$renderer, { children, $$slots: { default: true } });
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}