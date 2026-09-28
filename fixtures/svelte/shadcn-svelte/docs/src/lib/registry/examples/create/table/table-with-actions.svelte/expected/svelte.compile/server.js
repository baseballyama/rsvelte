import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Table from "$lib/registry/ui/table/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Table_with_actions($$renderer) {
	Example($$renderer, {
		title: 'With Actions',
		children: ($$renderer) => {
			if (Table.Root) {
				$$renderer.push('<!--[-->');

				Table.Root($$renderer, {
					children: ($$renderer) => {
						if (Table.Header) {
							$$renderer.push('<!--[-->');

							Table.Header($$renderer, {
								children: ($$renderer) => {
									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Product`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Price`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'text-right',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Actions`);
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
														class: 'font-medium',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Wireless Mouse`);
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
															$$renderer.push(`<!---->$29.99`);
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
															if (DropdownMenu.Root) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Root($$renderer, {
																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				Button($$renderer, $.spread_props([
																					{ variant: 'ghost', size: 'icon', class: 'size-8' },
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

																							$$renderer.push(`<!----> <span class="sr-only">Open menu</span>`);
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
																								$$renderer.push(`<!---->Edit`);
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
																								$$renderer.push(`<!---->Duplicate`);
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
																							variant: 'destructive',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Delete`);
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
														class: 'font-medium',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Mechanical Keyboard`);
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
															$$renderer.push(`<!---->$129.99`);
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
															if (DropdownMenu.Root) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Root($$renderer, {
																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				Button($$renderer, $.spread_props([
																					{ variant: 'ghost', size: 'icon', class: 'size-8' },
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

																							$$renderer.push(`<!----> <span class="sr-only">Open menu</span>`);
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
																								$$renderer.push(`<!---->Edit`);
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
																								$$renderer.push(`<!---->Duplicate`);
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
																							variant: 'destructive',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Delete`);
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
														class: 'font-medium',
														children: ($$renderer) => {
															$$renderer.push(`<!---->USB-C Hub`);
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
															$$renderer.push(`<!---->$49.99`);
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
															if (DropdownMenu.Root) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Root($$renderer, {
																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				Button($$renderer, $.spread_props([
																					{ variant: 'ghost', size: 'icon', class: 'size-8' },
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

																							$$renderer.push(`<!----> <span class="sr-only">Open menu</span>`);
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
																								$$renderer.push(`<!---->Edit`);
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
																								$$renderer.push(`<!---->Duplicate`);
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
																							variant: 'destructive',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Delete`);
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
}