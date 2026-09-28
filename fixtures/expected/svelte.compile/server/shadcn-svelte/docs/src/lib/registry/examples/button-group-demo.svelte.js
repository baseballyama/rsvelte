import * as $ from 'svelte/internal/server';
import Archive from "@lucide/svelte/icons/archive";
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import CalendarPlus from "@lucide/svelte/icons/calendar-plus";
import Clock from "@lucide/svelte/icons/clock";
import ListFilter from "@lucide/svelte/icons/list-filter";
import MailCheck from "@lucide/svelte/icons/mail-check";
import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
import Tag from "@lucide/svelte/icons/tag";
import Trash2 from "@lucide/svelte/icons/trash-2";
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
									size: 'icon-sm',
									'aria-label': 'Go Back',
									children: ($$renderer) => {
										ArrowLeft($$renderer, {});
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
									size: 'sm',
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Archive`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									size: 'sm',
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Report`);
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

					if (ButtonGroup.Root) {
						$$renderer.push('<!--[-->');

						ButtonGroup.Root($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									size: 'sm',
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
														props,
														{
															variant: 'outline',
															size: 'icon-sm',
															'aria-label': 'More Options',
															children: ($$renderer) => {
																MoreHorizontal($$renderer, {});
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
																				MailCheck($$renderer, {});
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
																				Archive($$renderer, {});
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
																				Clock($$renderer, {});
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
																				CalendarPlus($$renderer, {});
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
																				ListFilter($$renderer, {});
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
																							Tag($$renderer, {});
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
																			class: 'text-destructive focus:text-destructive',
																			children: ($$renderer) => {
																				Trash2($$renderer, {});
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