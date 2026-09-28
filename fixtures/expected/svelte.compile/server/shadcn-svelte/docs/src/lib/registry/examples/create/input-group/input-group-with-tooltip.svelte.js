import * as $ from 'svelte/internal/server';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_group_with_tooltip($$renderer) {
	let country = "+1";

	Example($$renderer, {
		title: 'With Tooltip, Dropdown, Popover',
		children: ($$renderer) => {
			if (Field.Group) {
				$$renderer.push('<!--[-->');

				Field.Group($$renderer, {
					children: ($$renderer) => {
						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-tooltip-20',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Tooltip`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-tooltip-20' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															if (Tooltip.Root) {
																$$renderer.push('<!--[-->');

																Tooltip.Root($$renderer, {
																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				if (InputGroup.Button) {
																					$$renderer.push('<!--[-->');

																					InputGroup.Button($$renderer, $.spread_props([
																						props,
																						{
																							class: 'rounded-full',
																							size: 'icon-xs',
																							children: ($$renderer) => {
																								IconPlaceholder($$renderer, {
																									lucide: 'InfoIcon',
																									tabler: 'IconInfoCircle',
																									hugeicons: 'AlertCircleIcon',
																									phosphor: 'InfoIcon',
																									remixicon: 'RiInformationLine'
																								});
																							},
																							$$slots: { default: true }
																						}
																					]));

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}

																			if (Tooltip.Trigger) {
																				$$renderer.push('<!--[-->');
																				Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(` `);

																		if (Tooltip.Content) {
																			$$renderer.push('<!--[-->');

																			Tooltip.Content($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->This is content in a tooltip.`);
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

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->This is a description of the input group.`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-dropdown-21',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Dropdown`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-dropdown-21' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															if (DropdownMenu.Root) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Root($$renderer, {
																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				if (InputGroup.Button) {
																					$$renderer.push('<!--[-->');

																					InputGroup.Button($$renderer, $.spread_props([
																						props,
																						{
																							class: 'text-muted-foreground tabular-nums',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(country)} `);

																								IconPlaceholder($$renderer, {
																									lucide: 'ChevronDownIcon',
																									tabler: 'IconChevronDown',
																									hugeicons: 'ArrowDownIcon',
																									phosphor: 'CaretDownIcon',
																									remixicon: 'RiArrowDownSLine'
																								});

																								$$renderer.push(`<!---->`);
																							},
																							$$slots: { default: true }
																						}
																					]));

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
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
																				class: 'min-w-16',
																				sideOffset: 10,
																				alignOffset: -8,
																				children: ($$renderer) => {
																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							onclick: () => country = "+1",
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->+1`);
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
																							onclick: () => country = "+44",
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->+44`);
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
																							onclick: () => country = "+46",
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->+46`);
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

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->This is a description of the input group.`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-secure-19',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Popover`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (Popover.Root) {
													$$renderer.push('<!--[-->');

													Popover.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	if (InputGroup.Addon) {
																		$$renderer.push('<!--[-->');

																		InputGroup.Addon($$renderer, $.spread_props([
																			props,
																			{
																				children: ($$renderer) => {
																					if (InputGroup.Button) {
																						$$renderer.push('<!--[-->');

																						InputGroup.Button($$renderer, {
																							variant: 'secondary',
																							size: 'icon-xs',
																							children: ($$renderer) => {
																								IconPlaceholder($$renderer, {
																									lucide: 'InfoIcon',
																									tabler: 'IconInfoCircle',
																									hugeicons: 'AlertCircleIcon',
																									phosphor: 'InfoIcon',
																									remixicon: 'RiInformationLine'
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
																			}
																		]));

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}

																if (Popover.Trigger) {
																	$$renderer.push('<!--[-->');
																	Popover.Trigger($$renderer, { child, $$slots: { child: true } });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(` `);

															if (Popover.Content) {
																$$renderer.push('<!--[-->');

																Popover.Content($$renderer, {
																	align: 'start',
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="space-y-2"><h4 class="leading-none font-medium">Your connection is not secure.</h4> <p class="text-sm text-muted-foreground">You should not enter any sensitive information on this site.</p></div>`);
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

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														class: 'pl-1 text-muted-foreground',
														children: ($$renderer) => {
															$$renderer.push(`<!---->https://`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-secure-19' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	size: 'icon-xs',
																	onclick: () => {},
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'StarIcon',
																			tabler: 'IconStar',
																			hugeicons: 'StarIcon',
																			phosphor: 'StarIcon',
																			remixicon: 'RiStarLine'
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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->This is a description of the input group.`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'url',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Button Group`);
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
												if (ButtonGroup.Text) {
													$$renderer.push('<!--[-->');

													ButtonGroup.Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->https://`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Root) {
													$$renderer.push('<!--[-->');

													InputGroup.Root($$renderer, {
														children: ($$renderer) => {
															if (InputGroup.Input) {
																$$renderer.push('<!--[-->');
																InputGroup.Input($$renderer, { id: 'url' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (InputGroup.Addon) {
																$$renderer.push('<!--[-->');

																InputGroup.Addon($$renderer, {
																	align: 'inline-end',
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'InfoIcon',
																			tabler: 'IconInfoCircle',
																			hugeicons: 'AlertCircleIcon',
																			phosphor: 'InfoIcon',
																			remixicon: 'RiInformationLine'
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

												if (ButtonGroup.Text) {
													$$renderer.push('<!--[-->');

													ButtonGroup.Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->.com`);
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

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->This is a description of the input group.`);
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