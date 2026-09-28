import * as $ from 'svelte/internal/server';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Payments($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						class: 'flex flex-col gap-3',
						children: ($$renderer) => {
							if (Breadcrumb.Root) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Root($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.List) {
											$$renderer.push('<!--[-->');

											Breadcrumb.List($$renderer, {
												children: ($$renderer) => {
													if (Breadcrumb.Item) {
														$$renderer.push('<!--[-->');

														Breadcrumb.Item($$renderer, {
															children: ($$renderer) => {
																if (Breadcrumb.Link) {
																	$$renderer.push('<!--[-->');

																	Breadcrumb.Link($$renderer, {
																		href: '#/',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Home`);
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

													if (Breadcrumb.Separator) {
														$$renderer.push('<!--[-->');
														Breadcrumb.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Breadcrumb.Item) {
														$$renderer.push('<!--[-->');

														Breadcrumb.Item($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.Root) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Root($$renderer, {
																		children: ($$renderer) => {
																			{
																				function child($$renderer, { props }) {
																					Button($$renderer, $.spread_props([
																						{ size: 'icon-sm', variant: 'ghost' },
																						props,
																						{
																							children: ($$renderer) => {
																								IconPlaceholder($$renderer, {
																									lucide: 'MoreHorizontalIcon',
																									tabler: 'IconDots',
																									hugeicons: 'MoreHorizontalCircle01Icon',
																									phosphor: 'DotsThreeIcon',
																									remixicon: 'RiMoreLine'
																								});

																								$$renderer.push(`<!----> <span class="sr-only">Account options</span>`);
																							},
																							$$slots: { default: true }
																						}
																					]));
																				}

																				if (DropdownMenu.Trigger) {
																					$$renderer.push('<!--[-->');
																					DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}

																			$$renderer.push(` `);

																			if (DropdownMenu.Content) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Content($$renderer, {
																					align: 'start',
																					children: ($$renderer) => {
																						if (DropdownMenu.Group) {
																							$$renderer.push('<!--[-->');

																							DropdownMenu.Group($$renderer, {
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Profile`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Statements`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Documents`);
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

													if (Breadcrumb.Separator) {
														$$renderer.push('<!--[-->');
														Breadcrumb.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Breadcrumb.Item) {
														$$renderer.push('<!--[-->');

														Breadcrumb.Item($$renderer, {
															children: ($$renderer) => {
																if (Breadcrumb.Page) {
																	$$renderer.push('<!--[-->');

																	Breadcrumb.Page($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Payments`);
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

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Item.Group) {
								$$renderer.push('<!--[-->');

								Item.Group($$renderer, {
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

												if (Item.Media) {
													$$renderer.push('<!--[-->');

													Item.Media($$renderer, {
														variant: 'icon',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'GaugeIcon',
																tabler: 'IconGauge',
																hugeicons: 'Settings01Icon',
																phosphor: 'GaugeIcon',
																remixicon: 'RiDashboardLine'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Item.Content) {
													$$renderer.push('<!--[-->');

													Item.Content($$renderer, {
														children: ($$renderer) => {
															if (Item.Title) {
																$$renderer.push('<!--[-->');

																Item.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Change transfer limit`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Item.Description) {
																$$renderer.push('<!--[-->');

																Item.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Adjust how much you can send from your balance.`);
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

												IconPlaceholder($$renderer, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$$renderer.push(`<!----></a>`);
											}

											if (Item.Root) {
												$$renderer.push('<!--[-->');
												Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										{
											function child($$renderer, { props }) {
												$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

												if (Item.Media) {
													$$renderer.push('<!--[-->');

													Item.Media($$renderer, {
														variant: 'icon',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'CalendarIcon',
																tabler: 'IconCalendar',
																hugeicons: 'Calendar03Icon',
																phosphor: 'CalendarIcon',
																remixicon: 'RiCalendarLine'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Item.Content) {
													$$renderer.push('<!--[-->');

													Item.Content($$renderer, {
														children: ($$renderer) => {
															if (Item.Title) {
																$$renderer.push('<!--[-->');

																Item.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Scheduled transfers`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Item.Description) {
																$$renderer.push('<!--[-->');

																Item.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Set up a transfer to send at a later date.`);
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

												IconPlaceholder($$renderer, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$$renderer.push(`<!----></a>`);
											}

											if (Item.Root) {
												$$renderer.push('<!--[-->');
												Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										{
											function child($$renderer, { props }) {
												$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

												if (Item.Media) {
													$$renderer.push('<!--[-->');

													Item.Media($$renderer, {
														variant: 'icon',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'RepeatIcon',
																tabler: 'IconRepeat',
																hugeicons: 'RepeatIcon',
																phosphor: 'RepeatIcon',
																remixicon: 'RiRepeatLine'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Item.Content) {
													$$renderer.push('<!--[-->');

													Item.Content($$renderer, {
														children: ($$renderer) => {
															if (Item.Title) {
																$$renderer.push('<!--[-->');

																Item.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Direct Debits`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Item.Description) {
																$$renderer.push('<!--[-->');

																Item.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Set up and manage regular payments.`);
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

												IconPlaceholder($$renderer, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$$renderer.push(`<!----></a>`);
											}

											if (Item.Root) {
												$$renderer.push('<!--[-->');
												Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										{
											function child($$renderer, { props }) {
												$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

												if (Item.Media) {
													$$renderer.push('<!--[-->');

													Item.Media($$renderer, {
														variant: 'icon',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'RefreshCwIcon',
																tabler: 'IconRefresh',
																hugeicons: 'RepeatIcon',
																phosphor: 'ArrowsClockwiseIcon',
																remixicon: 'RiRefreshLine'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Item.Content) {
													$$renderer.push('<!--[-->');

													Item.Content($$renderer, {
														children: ($$renderer) => {
															if (Item.Title) {
																$$renderer.push('<!--[-->');

																Item.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Recurring card payments`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Item.Description) {
																$$renderer.push('<!--[-->');

																Item.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Manage your repeated card transactions.`);
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

												IconPlaceholder($$renderer, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$$renderer.push(`<!----></a>`);
											}

											if (Item.Root) {
												$$renderer.push('<!--[-->');
												Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
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
}