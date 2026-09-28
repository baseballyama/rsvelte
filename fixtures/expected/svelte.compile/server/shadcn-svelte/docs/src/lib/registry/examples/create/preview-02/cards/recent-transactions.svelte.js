import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Recent_transactions($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Recent Transactions`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Your latest account activity.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Action) {
								$$renderer.push('<!--[-->');

								Card.Action($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->View All`);
											},
											$$slots: { default: true }
										});
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
							if (Table.Root) {
								$$renderer.push('<!--[-->');

								Table.Root($$renderer, {
									children: ($$renderer) => {
										if (Table.Body) {
											$$renderer.push('<!--[-->');

											Table.Body($$renderer, {
												children: ($$renderer) => {
													if (Table.Row) {
														$$renderer.push('<!--[-->');

														Table.Row($$renderer, {
															children: ($$renderer) => {
																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-10',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex size-10 items-center justify-center rounded-lg bg-muted">`);

																			IconPlaceholder($$renderer, {
																				class: 'size-4 shrink-0',
																				lucide: 'CoffeeIcon',
																				tabler: 'IconCoffee',
																				hugeicons: 'CoffeeIcon',
																				phosphor: 'CoffeeIcon',
																				remixicon: 'RiCupLine'
																			});

																			$$renderer.push(`<!----></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><span class="font-medium">Blue Bottle Coffee</span> <span class="text-sm text-muted-foreground">Food &amp; Drink</span></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Today, 10:24 AM`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-right',
																		children: ($$renderer) => {
																			$$renderer.push(`<span class="text-sm font-semibold tabular-nums">-$6.50</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-8',
																		children: ($$renderer) => {
																			if (DropdownMenu.Root) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Root($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								Button($$renderer, $.spread_props([
																									{ variant: 'ghost', size: 'icon-sm' },
																									props,
																									{
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'MoreHorizontalIcon',
																												tabler: 'IconDotsVertical',
																												hugeicons: 'MoreVerticalCircle01Icon',
																												phosphor: 'DotsThreeIcon',
																												remixicon: 'RiMore2Line'
																											});
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
																								align: 'end',
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->View details`);
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
																												$$renderer.push(`<!---->Add note`);
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
																												$$renderer.push(`<!---->Categorize`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Separator) {
																										$$renderer.push('<!--[-->');
																										DropdownMenu.Separator($$renderer, {});
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
																												$$renderer.push(`<!---->Dispute`);
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

													if (Table.Row) {
														$$renderer.push('<!--[-->');

														Table.Row($$renderer, {
															children: ($$renderer) => {
																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-10',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex size-10 items-center justify-center rounded-lg bg-muted">`);

																			IconPlaceholder($$renderer, {
																				class: 'size-4 shrink-0',
																				lucide: 'ShoppingCartIcon',
																				tabler: 'IconShoppingCart',
																				hugeicons: 'ShoppingCart01Icon',
																				phosphor: 'ShoppingCartIcon',
																				remixicon: 'RiShoppingCartLine'
																			});

																			$$renderer.push(`<!----></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><span class="font-medium">Whole Foods Market</span> <span class="text-sm text-muted-foreground">Groceries</span></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Yesterday`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-right',
																		children: ($$renderer) => {
																			$$renderer.push(`<span class="text-sm font-semibold tabular-nums">-$142.30</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-8',
																		children: ($$renderer) => {
																			if (DropdownMenu.Root) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Root($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								Button($$renderer, $.spread_props([
																									{ variant: 'ghost', size: 'icon-sm' },
																									props,
																									{
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'MoreHorizontalIcon',
																												tabler: 'IconDotsVertical',
																												hugeicons: 'MoreVerticalCircle01Icon',
																												phosphor: 'DotsThreeIcon',
																												remixicon: 'RiMore2Line'
																											});
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
																								align: 'end',
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->View details`);
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
																												$$renderer.push(`<!---->Add note`);
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
																												$$renderer.push(`<!---->Categorize`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Separator) {
																										$$renderer.push('<!--[-->');
																										DropdownMenu.Separator($$renderer, {});
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
																												$$renderer.push(`<!---->Dispute`);
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

													if (Table.Row) {
														$$renderer.push('<!--[-->');

														Table.Row($$renderer, {
															children: ($$renderer) => {
																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-10',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex size-10 items-center justify-center rounded-lg bg-muted">`);

																			IconPlaceholder($$renderer, {
																				class: 'size-4 shrink-0',
																				lucide: 'WalletIcon',
																				tabler: 'IconWallet',
																				hugeicons: 'Wallet01Icon',
																				phosphor: 'WalletIcon',
																				remixicon: 'RiWalletLine'
																			});

																			$$renderer.push(`<!----></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><span class="font-medium">Stripe Payout</span> <span class="text-sm text-muted-foreground">Income</span></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Oct 12`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-right',
																		children: ($$renderer) => {
																			$$renderer.push(`<span class="text-sm font-semibold text-emerald-500 tabular-nums">+$4,200.00</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-8',
																		children: ($$renderer) => {
																			if (DropdownMenu.Root) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Root($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								Button($$renderer, $.spread_props([
																									{ variant: 'ghost', size: 'icon-sm' },
																									props,
																									{
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'MoreHorizontalIcon',
																												tabler: 'IconDotsVertical',
																												hugeicons: 'MoreVerticalCircle01Icon',
																												phosphor: 'DotsThreeIcon',
																												remixicon: 'RiMore2Line'
																											});
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
																								align: 'end',
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->View details`);
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
																												$$renderer.push(`<!---->Add note`);
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
																												$$renderer.push(`<!---->Categorize`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Separator) {
																										$$renderer.push('<!--[-->');
																										DropdownMenu.Separator($$renderer, {});
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
																												$$renderer.push(`<!---->Dispute`);
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

													if (Table.Row) {
														$$renderer.push('<!--[-->');

														Table.Row($$renderer, {
															children: ($$renderer) => {
																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-10',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex size-10 items-center justify-center rounded-lg bg-muted">`);

																			IconPlaceholder($$renderer, {
																				class: 'size-4 shrink-0',
																				lucide: 'CarIcon',
																				tabler: 'IconCar',
																				hugeicons: 'Car01Icon',
																				phosphor: 'CarIcon',
																				remixicon: 'RiCarLine'
																			});

																			$$renderer.push(`<!----></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><span class="font-medium">Uber Technologies</span> <span class="text-sm text-muted-foreground">Transport</span></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Oct 11`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-right',
																		children: ($$renderer) => {
																			$$renderer.push(`<span class="text-sm font-semibold tabular-nums">-$24.10</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-8',
																		children: ($$renderer) => {
																			if (DropdownMenu.Root) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Root($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								Button($$renderer, $.spread_props([
																									{ variant: 'ghost', size: 'icon-sm' },
																									props,
																									{
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'MoreHorizontalIcon',
																												tabler: 'IconDotsVertical',
																												hugeicons: 'MoreVerticalCircle01Icon',
																												phosphor: 'DotsThreeIcon',
																												remixicon: 'RiMore2Line'
																											});
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
																								align: 'end',
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->View details`);
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
																												$$renderer.push(`<!---->Add note`);
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
																												$$renderer.push(`<!---->Categorize`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Separator) {
																										$$renderer.push('<!--[-->');
																										DropdownMenu.Separator($$renderer, {});
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
																												$$renderer.push(`<!---->Dispute`);
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

													if (Table.Row) {
														$$renderer.push('<!--[-->');

														Table.Row($$renderer, {
															children: ($$renderer) => {
																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-10',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex size-10 items-center justify-center rounded-lg bg-muted">`);

																			IconPlaceholder($$renderer, {
																				class: 'size-4 shrink-0',
																				lucide: 'TvIcon',
																				tabler: 'IconDeviceTv',
																				hugeicons: 'Tv01Icon',
																				phosphor: 'TelevisionIcon',
																				remixicon: 'RiTvLine'
																			});

																			$$renderer.push(`<!----></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex flex-col"><span class="font-medium">Netflix Subscription</span> <span class="text-sm text-muted-foreground">Entertainment</span></div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-sm text-muted-foreground',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Oct 10`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'text-right',
																		children: ($$renderer) => {
																			$$renderer.push(`<span class="text-sm font-semibold tabular-nums">-$19.99</span>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Table.Cell) {
																	$$renderer.push('<!--[-->');

																	Table.Cell($$renderer, {
																		class: 'w-8',
																		children: ($$renderer) => {
																			if (DropdownMenu.Root) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Root($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								Button($$renderer, $.spread_props([
																									{ variant: 'ghost', size: 'icon-sm' },
																									props,
																									{
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'MoreHorizontalIcon',
																												tabler: 'IconDotsVertical',
																												hugeicons: 'MoreVerticalCircle01Icon',
																												phosphor: 'DotsThreeIcon',
																												remixicon: 'RiMore2Line'
																											});
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
																								align: 'end',
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->View details`);
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
																												$$renderer.push(`<!---->Add note`);
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
																												$$renderer.push(`<!---->Categorize`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Separator) {
																										$$renderer.push('<!--[-->');
																										DropdownMenu.Separator($$renderer, {});
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
																												$$renderer.push(`<!---->Dispute`);
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
}