import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Codespaces_card($$renderer) {
	let isCreatingCodespace = false;

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Tabs.Root) {
								$$renderer.push('<!--[-->');

								Tabs.Root($$renderer, {
									value: 'codespaces',
									children: ($$renderer) => {
										if (Tabs.List) {
											$$renderer.push('<!--[-->');

											Tabs.List($$renderer, {
												class: 'w-full',
												children: ($$renderer) => {
													if (Tabs.Trigger) {
														$$renderer.push('<!--[-->');

														Tabs.Trigger($$renderer, {
															value: 'codespaces',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Codespaces`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Tabs.Trigger) {
														$$renderer.push('<!--[-->');

														Tabs.Trigger($$renderer, {
															value: 'local',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Local`);
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

										if (Tabs.Content) {
											$$renderer.push('<!--[-->');

											Tabs.Content($$renderer, {
												value: 'codespaces',
												children: ($$renderer) => {
													if (Item.Root) {
														$$renderer.push('<!--[-->');

														Item.Root($$renderer, {
															size: 'sm',
															class: 'px-1 pt-2',
															children: ($$renderer) => {
																if (Item.Content) {
																	$$renderer.push('<!--[-->');

																	Item.Content($$renderer, {
																		children: ($$renderer) => {
																			if (Item.Title) {
																				$$renderer.push('<!--[-->');

																				Item.Title($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Codespaces`);
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
																						$$renderer.push(`<!---->Your workspaces in the cloud`);
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
																			if (Tooltip.Root) {
																				$$renderer.push('<!--[-->');

																				Tooltip.Root($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								Button($$renderer, $.spread_props([
																									{ variant: 'ghost', size: 'icon-sm' },
																									props,
																									{
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'PlusIcon',
																												tabler: 'IconPlus',
																												hugeicons: 'PlusSignIcon',
																												phosphor: 'PlusIcon',
																												remixicon: 'RiAddLine'
																											});
																										},
																										$$slots: { default: true }
																									}
																								]));
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
																								side: 'bottom',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Create a codespace on main`);
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
																												tabler: 'IconDots',
																												hugeicons: 'MoreHorizontalCircle01Icon',
																												phosphor: 'DotsThreeOutlineIcon',
																												remixicon: 'RiMoreLine'
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
																								class: 'w-56',
																								children: ($$renderer) => {
																									if (DropdownMenu.Group) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Group($$renderer, {
																											children: ($$renderer) => {
																												if (DropdownMenu.Item) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.Item($$renderer, {
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'PlusIcon',
																																tabler: 'IconPlus',
																																hugeicons: 'PlusSignIcon',
																																phosphor: 'PlusIcon',
																																remixicon: 'RiAddLine'
																															});

																															$$renderer.push(`<!----> New with options...`);
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
																															IconPlaceholder($$renderer, {
																																lucide: 'ContainerIcon',
																																tabler: 'IconBox',
																																hugeicons: 'CubeIcon',
																																phosphor: 'CubeIcon',
																																remixicon: 'RiBox1Line'
																															});

																															$$renderer.push(`<!----> Configure dev container`);
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
																															IconPlaceholder($$renderer, {
																																lucide: 'ZapIcon',
																																tabler: 'IconBolt',
																																hugeicons: 'ZapIcon',
																																phosphor: 'LightningIcon',
																																remixicon: 'RiFlashlightLine'
																															});

																															$$renderer.push(`<!----> Set up prebuilds`);
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
																															IconPlaceholder($$renderer, {
																																lucide: 'ServerIcon',
																																tabler: 'IconServer',
																																hugeicons: 'ServerStackIcon',
																																phosphor: 'HardDrivesIcon',
																																remixicon: 'RiHardDriveLine'
																															});

																															$$renderer.push(`<!----> Manage codespaces`);
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
																															IconPlaceholder($$renderer, {
																																lucide: 'ShareIcon',
																																tabler: 'IconShare2',
																																hugeicons: 'Share03Icon',
																																phosphor: 'ShareIcon',
																																remixicon: 'RiShareLine'
																															});

																															$$renderer.push(`<!----> Share deep link`);
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
																															IconPlaceholder($$renderer, {
																																lucide: 'InfoIcon',
																																tabler: 'IconInfoCircle',
																																hugeicons: 'AlertCircleIcon',
																																phosphor: 'InfoIcon',
																																remixicon: 'RiInformationLine'
																															});

																															$$renderer.push(`<!----> What are codespaces?`);
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

													$$renderer.push(` `);
													Separator($$renderer, { class: '-mx-2 my-2 w-auto!' });
													$$renderer.push(`<!----> `);

													if (Empty.Root) {
														$$renderer.push('<!--[-->');

														Empty.Root($$renderer, {
															class: 'p-4',
															children: ($$renderer) => {
																if (Empty.Header) {
																	$$renderer.push('<!--[-->');

																	Empty.Header($$renderer, {
																		children: ($$renderer) => {
																			if (Empty.Media) {
																				$$renderer.push('<!--[-->');

																				Empty.Media($$renderer, {
																					variant: 'icon',
																					children: ($$renderer) => {
																						IconPlaceholder($$renderer, {
																							lucide: 'ServerIcon',
																							tabler: 'IconServer',
																							hugeicons: 'ServerStackIcon',
																							phosphor: 'HardDrivesIcon',
																							remixicon: 'RiHardDriveLine'
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

																			if (Empty.Title) {
																				$$renderer.push('<!--[-->');

																				Empty.Title($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->No codespaces`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Empty.Description) {
																				$$renderer.push('<!--[-->');

																				Empty.Description($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->You don't have any codespaces with this repository checked out`);
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

																if (Empty.Content) {
																	$$renderer.push('<!--[-->');

																	Empty.Content($$renderer, {
																		children: ($$renderer) => {
																			Button($$renderer, {
																				size: 'sm',
																				disabled: isCreatingCodespace,
																				onclick: () => {
																					isCreatingCodespace = true;
																					setTimeout(() => isCreatingCodespace = false, 2000);
																				},

																				children: ($$renderer) => {
																					if (isCreatingCodespace) {
																						$$renderer.push('<!--[0-->');
																						Spinner($$renderer, { 'data-icon': 'inline-start' });
																					} else {
																						$$renderer.push('<!--[-1-->');
																					}

																					$$renderer.push(`<!--]--> Create Codespace`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> <a href="#learn-more" class="text-xs text-muted-foreground underline underline-offset-4">Learn more about codespaces</a>`);
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
													Separator($$renderer, { class: '-mx-2 my-2 w-auto!' });
													$$renderer.push(`<!----> <div class="p-1.5 text-xs text-muted-foreground">Codespace usage for this repository is paid for by <span class="font-medium">shadcn</span>.</div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tabs.Content) {
											$$renderer.push('<!--[-->');

											Tabs.Content($$renderer, {
												value: 'local',
												children: ($$renderer) => {
													if (Item.Root) {
														$$renderer.push('<!--[-->');

														Item.Root($$renderer, {
															size: 'sm',
															class: 'hidden p-0',
															children: ($$renderer) => {
																if (Item.Content) {
																	$$renderer.push('<!--[-->');

																	Item.Content($$renderer, {
																		children: ($$renderer) => {
																			if (Item.Title) {
																				$$renderer.push('<!--[-->');

																				Item.Title($$renderer, {
																					class: 'gap-2',
																					children: ($$renderer) => {
																						IconPlaceholder($$renderer, {
																							lucide: 'TerminalIcon',
																							tabler: 'IconTerminal',
																							hugeicons: 'ComputerTerminal01Icon',
																							phosphor: 'TerminalIcon',
																							remixicon: 'RiTerminalBoxLine',
																							class: 'size-4'
																						});

																						$$renderer.push(`<!----> Clone`);
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
																			if (Tooltip.Root) {
																				$$renderer.push('<!--[-->');

																				Tooltip.Root($$renderer, {
																					children: ($$renderer) => {
																						{
																							function child($$renderer, { props }) {
																								Button($$renderer, $.spread_props([
																									{ variant: 'ghost', size: 'icon' },
																									props,
																									{
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
																								side: 'left',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Which remote URL should I use?`);
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

													if (Tabs.Root) {
														$$renderer.push('<!--[-->');

														Tabs.Root($$renderer, {
															value: 'https',
															children: ($$renderer) => {
																if (Tabs.List) {
																	$$renderer.push('<!--[-->');

																	Tabs.List($$renderer, {
																		variant: 'line',
																		class: 'w-full justify-start border-b *:[button]:flex-0',
																		children: ($$renderer) => {
																			if (Tabs.Trigger) {
																				$$renderer.push('<!--[-->');

																				Tabs.Trigger($$renderer, {
																					value: 'https',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->HTTPS`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Tabs.Trigger) {
																				$$renderer.push('<!--[-->');

																				Tabs.Trigger($$renderer, {
																					value: 'ssh',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->SSH`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Tabs.Trigger) {
																				$$renderer.push('<!--[-->');

																				Tabs.Trigger($$renderer, {
																					value: 'cli',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->GitHub CLI`);
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

																$$renderer.push(` <div class="rounded-md border bg-muted/30 p-2">`);

																if (Tabs.Content) {
																	$$renderer.push('<!--[-->');

																	Tabs.Content($$renderer, {
																		value: 'https',
																		children: ($$renderer) => {
																			if (Field.Field) {
																				$$renderer.push('<!--[-->');

																				Field.Field($$renderer, {
																					class: 'gap-2',
																					children: ($$renderer) => {
																						if (Field.Label) {
																							$$renderer.push('<!--[-->');

																							Field.Label($$renderer, {
																								for: 'https-url',
																								class: 'sr-only',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->HTTPS URL`);
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
																									if (InputGroup.Addon) {
																										$$renderer.push('<!--[-->');

																										InputGroup.Addon($$renderer, {
																											align: 'inline-end',
																											children: ($$renderer) => {
																												if (InputGroup.Button) {
																													$$renderer.push('<!--[-->');

																													InputGroup.Button($$renderer, {
																														variant: 'ghost',
																														size: 'icon-xs',
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'CopyIcon',
																																tabler: 'IconCopy',
																																hugeicons: 'Copy01Icon',
																																phosphor: 'CopyIcon',
																																remixicon: 'RiFileCopyLine'
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

																									if (InputGroup.Input) {
																										$$renderer.push('<!--[-->');

																										InputGroup.Input($$renderer, {
																											id: 'https-url',
																											value: 'https://github.com/shadcn-ui/ui.git',
																											readonly: true
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
																									$$renderer.push(`<!---->Clone using the web URL.`);
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

																if (Tabs.Content) {
																	$$renderer.push('<!--[-->');

																	Tabs.Content($$renderer, {
																		value: 'ssh',
																		children: ($$renderer) => {
																			if (Field.Field) {
																				$$renderer.push('<!--[-->');

																				Field.Field($$renderer, {
																					class: 'gap-2',
																					children: ($$renderer) => {
																						if (Field.Label) {
																							$$renderer.push('<!--[-->');

																							Field.Label($$renderer, {
																								for: 'ssh-url',
																								class: 'sr-only',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->SSH URL`);
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
																									if (InputGroup.Addon) {
																										$$renderer.push('<!--[-->');

																										InputGroup.Addon($$renderer, {
																											align: 'inline-end',
																											children: ($$renderer) => {
																												if (InputGroup.Button) {
																													$$renderer.push('<!--[-->');

																													InputGroup.Button($$renderer, {
																														variant: 'ghost',
																														size: 'icon-xs',
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'CopyIcon',
																																tabler: 'IconCopy',
																																hugeicons: 'Copy01Icon',
																																phosphor: 'CopyIcon',
																																remixicon: 'RiFileCopyLine'
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

																									if (InputGroup.Input) {
																										$$renderer.push('<!--[-->');

																										InputGroup.Input($$renderer, {
																											id: 'ssh-url',
																											value: 'git@github.com:shadcn-ui/ui.git',
																											readonly: true
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
																									$$renderer.push(`<!---->Use a password-protected SSH key.`);
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

																if (Tabs.Content) {
																	$$renderer.push('<!--[-->');

																	Tabs.Content($$renderer, {
																		value: 'cli',
																		children: ($$renderer) => {
																			if (Field.Field) {
																				$$renderer.push('<!--[-->');

																				Field.Field($$renderer, {
																					class: 'gap-2',
																					children: ($$renderer) => {
																						if (Field.Label) {
																							$$renderer.push('<!--[-->');

																							Field.Label($$renderer, {
																								for: 'cli-command',
																								class: 'sr-only',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->CLI Command`);
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
																									if (InputGroup.Addon) {
																										$$renderer.push('<!--[-->');

																										InputGroup.Addon($$renderer, {
																											align: 'inline-end',
																											children: ($$renderer) => {
																												if (InputGroup.Button) {
																													$$renderer.push('<!--[-->');

																													InputGroup.Button($$renderer, {
																														variant: 'ghost',
																														size: 'icon-xs',
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'CopyIcon',
																																tabler: 'IconCopy',
																																hugeicons: 'Copy01Icon',
																																phosphor: 'CopyIcon',
																																remixicon: 'RiFileCopyLine'
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

																									if (InputGroup.Input) {
																										$$renderer.push('<!--[-->');

																										InputGroup.Input($$renderer, {
																											id: 'cli-command',
																											value: 'gh repo clone shadcn-ui/ui',
																											readonly: true
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
																									$$renderer.push(`<!---->Work fast with our official CLI. <a href="https://cli.github.com">Learn more</a>`);
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

																$$renderer.push(`</div>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);
													Separator($$renderer, { class: '-mx-2 my-2 w-auto!' });
													$$renderer.push(`<!----> <div class="flex flex-col">`);

													Button($$renderer, {
														variant: 'ghost',
														size: 'sm',
														class: 'justify-start gap-1.5',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'MonitorIcon',
																tabler: 'IconDeviceDesktop',
																hugeicons: 'ComputerIcon',
																phosphor: 'MonitorIcon',
																remixicon: 'RiComputerLine',
																'data-icon': 'inline-start'
															});

															$$renderer.push(`<!----> Open with GitHub Desktop`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'ghost',
														size: 'sm',
														class: 'justify-start gap-1.5',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'DownloadIcon',
																tabler: 'IconDownload',
																hugeicons: 'DownloadIcon',
																phosphor: 'DownloadIcon',
																remixicon: 'RiDownloadLine',
																'data-icon': 'inline-start'
															});

															$$renderer.push(`<!----> Download ZIP`);
														},
														$$slots: { default: true }
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