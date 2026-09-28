import * as $ from 'svelte/internal/server';
import ArchiveIcon from "@lucide/svelte/icons/archive";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus";
import ClockIcon from "@lucide/svelte/icons/clock";
import ListFilterIcon from "@lucide/svelte/icons/list-filter";
import MailCheckIcon from "@lucide/svelte/icons/mail-check";
import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
import TagIcon from "@lucide/svelte/icons/tag";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_group_demo($$renderer) {
	let label = "personal";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (ButtonGroup.Root) {
			$$renderer.push('<!--[-->');

			ButtonGroup.Root($$renderer, {
				children: ($$renderer) => {
					if (ButtonGroup.Root) {
						$$renderer.push('<!--[-->');

						ButtonGroup.Root($$renderer, {
							class: 'hidden sm:flex',
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'outline',
									size: 'icon',
									'aria-label': 'Go Back',
									children: ($$renderer) => {
										ArrowLeftIcon($$renderer, {});
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

					$$renderer.push(` `);

					if (ButtonGroup.Root) {
						$$renderer.push('<!--[-->');

						ButtonGroup.Root($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Archive`);
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

					$$renderer.push(` `);

					if (ButtonGroup.Root) {
						$$renderer.push('<!--[-->');

						ButtonGroup.Root($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Snooze`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								if (DropdownMenu.Root) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Root($$renderer, {
										children: ($$renderer) => {
											{
												function child($$renderer, { props }) {
													Button($$renderer, $.spread_props([
														{
															variant: 'outline',
															size: 'icon',
															'aria-label': 'More Options'
														},
														props,
														{
															children: ($$renderer) => {
																MoreHorizontalIcon($$renderer, {});
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
													class: 'w-52',
													children: ($$renderer) => {
														if (DropdownMenu.Group) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Group($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.Item) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Item($$renderer, {
																			children: ($$renderer) => {
																				MailCheckIcon($$renderer, {});
																				$$renderer.push(`<!----> Mark as Read`);
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
																				ArchiveIcon($$renderer, {});
																				$$renderer.push(`<!----> Archive`);
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

														if (DropdownMenu.Separator) {
															$$renderer.push('<!--[-->');
															DropdownMenu.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Group) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Group($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.Item) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Item($$renderer, {
																			children: ($$renderer) => {
																				ClockIcon($$renderer, {});
																				$$renderer.push(`<!----> Snooze`);
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
																				CalendarPlusIcon($$renderer, {});
																				$$renderer.push(`<!----> Add to Calendar`);
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
																				ListFilterIcon($$renderer, {});
																				$$renderer.push(`<!----> Add to List`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (DropdownMenu.Sub) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Sub($$renderer, {
																			children: ($$renderer) => {
																				if (DropdownMenu.SubTrigger) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.SubTrigger($$renderer, {
																						children: ($$renderer) => {
																							TagIcon($$renderer, {});
																							$$renderer.push(`<!----> Label As...`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (DropdownMenu.SubContent) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.SubContent($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.RadioGroup) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.RadioGroup($$renderer, {
																									get value() {
																										return label;
																									},

																									set value($$value) {
																										label = $$value;
																										$$settled = false;
																									},

																									children: ($$renderer) => {
																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: 'personal',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Personal`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: 'work',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Work`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: 'other',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Other`);
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

														if (DropdownMenu.Separator) {
															$$renderer.push('<!--[-->');
															DropdownMenu.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Group) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Group($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.Item) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Item($$renderer, {
																			variant: 'destructive',
																			children: ($$renderer) => {
																				Trash2Icon($$renderer, {});
																				$$renderer.push(`<!----> Trash`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}