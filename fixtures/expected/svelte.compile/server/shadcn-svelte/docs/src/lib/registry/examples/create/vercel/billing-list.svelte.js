import * as $ from 'svelte/internal/server';
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Billing_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const billingItems = [
			{
				month: "November 2025",
				invoiceDate: new CalendarDate(2025, 11, 5),
				amount: "$10.00",
				status: "Paid"
			},

			{
				month: "October 2025",
				invoiceDate: new CalendarDate(2025, 10, 4),
				amount: "$10.00",
				status: "Paid"
			},

			{
				month: "September 2025",
				invoiceDate: new CalendarDate(2025, 9, 4),
				amount: "$10.00",
				status: "Paid"
			}
		];

		const dateFormatter = new DateFormatter("en-US", { day: "numeric", month: "short", year: "numeric" });

		Example($$renderer, {
			title: 'Billing',
			class: 'items-center lg:p-16',
			containerClass: 'col-span-full',
			children: ($$renderer) => {
				if (Item.Group) {
					$$renderer.push('<!--[-->');

					Item.Group($$renderer, {
						class: 'max-w-7xl gap-0 rounded-lg border',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(billingItems);

							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let item = each_array[index];

								if (Item.Root) {
									$$renderer.push('<!--[-->');

									Item.Root($$renderer, {
										class: 'grid grid-cols-[1fr_auto] lg:grid-cols-[2fr_1fr_1fr_auto]',
										children: ($$renderer) => {
											if (Item.Content) {
												$$renderer.push('<!--[-->');

												Item.Content($$renderer, {
													children: ($$renderer) => {
														if (Item.Title) {
															$$renderer.push('<!--[-->');

															Item.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(item.month)} `);

																	Badge($$renderer, {
																		variant: 'secondary',
																		class: 'bg-green-100 text-green-700 hover:bg-green-100',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.status)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!---->`);
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
																	$$renderer.push(`<!---->Infrastructure usage &amp; Vercel platform`);
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

											if (Item.Content) {
												$$renderer.push('<!--[-->');

												Item.Content($$renderer, {
													class: 'hidden lg:flex',
													children: ($$renderer) => {
														if (Item.Title) {
															$$renderer.push('<!--[-->');

															Item.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Total Due`);
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
																	$$renderer.push(`<!---->${$.escape(item.amount)}`);
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

											if (Item.Content) {
												$$renderer.push('<!--[-->');

												Item.Content($$renderer, {
													class: 'hidden lg:flex',
													children: ($$renderer) => {
														if (Item.Description) {
															$$renderer.push('<!--[-->');

															Item.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Invoiced ${$.escape(dateFormatter.format(item.invoiceDate.toDate(getLocalTimeZone())))}`);
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

											if (Item.Actions) {
												$$renderer.push('<!--[-->');

												Item.Actions($$renderer, {
													children: ($$renderer) => {
														if (DropdownMenu.Root) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Root($$renderer, {
																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			Button($$renderer, $.spread_props([
																				{ variant: 'ghost', size: 'icon' },
																				props,
																				{
																					children: ($$renderer) => {
																						IconPlaceholder($$renderer, {
																							lucide: 'MoreHorizontalIcon',
																							tabler: 'IconDots',
																							hugeicons: 'MoreHorizontalCircle01Icon',
																							phosphor: 'DotsThreeOutlineIcon',
																							remixicon: 'RiMoreLine'
																						});

																						$$renderer.push(`<!----> <span class="sr-only">More options</span>`);
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
																							$$renderer.push(`<!---->View invoice`);
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
																							$$renderer.push(`<!---->Download PDF`);
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
																							$$renderer.push(`<!---->Contact support`);
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

											if (Item.Footer) {
												$$renderer.push('<!--[-->');

												Item.Footer($$renderer, {
													class: 'col-span-full w-full border-t pt-4 lg:hidden',
													children: ($$renderer) => {
														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Total Due`);
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
																				$$renderer.push(`<!---->${$.escape(item.amount)}`);
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Description) {
																		$$renderer.push('<!--[-->');

																		Item.Description($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Invoiced ${$.escape(dateFormatter.format(item.invoiceDate.toDate(getLocalTimeZone())))}`);
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

								if (index !== billingItems.length - 1) {
									$$renderer.push('<!--[0-->');

									if (Item.Separator) {
										$$renderer.push('<!--[-->');
										Item.Separator($$renderer, { class: 'my-0' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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
	});
}