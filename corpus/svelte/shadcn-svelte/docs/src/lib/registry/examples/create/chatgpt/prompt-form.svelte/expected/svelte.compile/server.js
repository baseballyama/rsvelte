import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Prompt_form($$renderer) {
	let dictateEnabled = false;

	Example($$renderer, {
		title: 'Prompt Form',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'prompt',
								class: 'sr-only',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Prompt`);
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
									if (InputGroup.Textarea) {
										$$renderer.push('<!--[-->');
										InputGroup.Textarea($$renderer, { id: 'prompt', placeholder: 'Ask anything' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											align: 'block-end',
											children: ($$renderer) => {
												if (Tooltip.Root) {
													$$renderer.push('<!--[-->');

													Tooltip.Root($$renderer, {
														children: ($$renderer) => {
															if (DropdownMenu.Root) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Root($$renderer, {
																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				{
																					function child($$renderer, { props: triggerProps }) {
																						if (InputGroup.Button) {
																							$$renderer.push('<!--[-->');

																							InputGroup.Button($$renderer, $.spread_props([
																								{
																									variant: 'ghost',
																									size: 'icon-sm',
																									onclick: () => dictateEnabled = !dictateEnabled,
																									class: 'rounded-4xl'
																								},
																								props,
																								triggerProps,
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
																					$$renderer.push(`<!---->Add files and more `);

																					if (Kbd.Root) {
																						$$renderer.push('<!--[-->');

																						Kbd.Root($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->/`);
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

																		if (DropdownMenu.Content) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Content($$renderer, {
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
																												lucide: 'PaperclipIcon',
																												tabler: 'IconPaperclip',
																												hugeicons: 'AttachmentIcon',
																												phosphor: 'PaperclipIcon',
																												remixicon: 'RiAttachmentLine'
																											});

																											$$renderer.push(`<!----> Add photos &amp; files`);
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
																												lucide: 'SparklesIcon',
																												tabler: 'IconSparkles',
																												hugeicons: 'SparklesIcon',
																												phosphor: 'SparkleIcon',
																												remixicon: 'RiSparklingLine'
																											});

																											$$renderer.push(`<!----> Deep research`);
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
																												lucide: 'ShoppingBagIcon',
																												tabler: 'IconShoppingBag',
																												hugeicons: 'ShoppingBag01Icon',
																												phosphor: 'BagIcon',
																												remixicon: 'RiShoppingBagLine'
																											});

																											$$renderer.push(`<!----> Shopping research`);
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
																												lucide: 'WandIcon',
																												tabler: 'IconWand',
																												hugeicons: 'MagicWand05Icon',
																												phosphor: 'MagicWandIcon',
																												remixicon: 'RiMagicLine'
																											});

																											$$renderer.push(`<!----> Create image`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (Tooltip.Root) {
																									$$renderer.push('<!--[-->');

																									Tooltip.Root($$renderer, {
																										children: ($$renderer) => {
																											{
																												function child($$renderer, { props }) {
																													if (DropdownMenu.Item) {
																														$$renderer.push('<!--[-->');

																														DropdownMenu.Item($$renderer, $.spread_props([
																															props,
																															{
																																children: ($$renderer) => {
																																	IconPlaceholder($$renderer, {
																																		lucide: 'MousePointerIcon',
																																		tabler: 'IconPointer',
																																		hugeicons: 'Cursor01Icon',
																																		phosphor: 'HandPointingIcon',
																																		remixicon: 'RiCursorLine'
																																	});

																																	$$renderer.push(`<!----> Agent mode`);
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
																													side: 'right',
																													children: ($$renderer) => {
																														$$renderer.push(`<div class="font-medium">35 left</div> <div class="text-xs text-primary-foreground/80">More available for purchase</div>`);
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

																					if (DropdownMenu.Sub) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Sub($$renderer, {
																							children: ($$renderer) => {
																								if (DropdownMenu.SubTrigger) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.SubTrigger($$renderer, {
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'MoreHorizontalIcon',
																												tabler: 'IconDots',
																												hugeicons: 'MoreHorizontalCircle01Icon',
																												phosphor: 'DotsThreeOutlineIcon',
																												remixicon: 'RiMoreLine'
																											});

																											$$renderer.push(`<!----> More`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (DropdownMenu.Portal) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Portal($$renderer, {
																										children: ($$renderer) => {
																											if (DropdownMenu.SubContent) {
																												$$renderer.push('<!--[-->');

																												DropdownMenu.SubContent($$renderer, {
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
																																					lucide: 'ShareIcon',
																																					tabler: 'IconShare',
																																					hugeicons: 'Share03Icon',
																																					phosphor: 'ShareIcon',
																																					remixicon: 'RiShareLine'
																																				});

																																				$$renderer.push(`<!----> Add sources`);
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
																																					lucide: 'BookOpenIcon',
																																					tabler: 'IconBook',
																																					hugeicons: 'BookIcon',
																																					phosphor: 'BookOpenIcon',
																																					remixicon: 'RiBookOpenLine'
																																				});

																																				$$renderer.push(`<!----> Study and learn`);
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
																																					lucide: 'GlobeIcon',
																																					tabler: 'IconWorld',
																																					hugeicons: 'GlobalIcon',
																																					phosphor: 'GlobeIcon',
																																					remixicon: 'RiGlobalLine'
																																				});

																																				$$renderer.push(`<!----> Web search`);
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
																																					lucide: 'PenToolIcon',
																																					tabler: 'IconPencil',
																																					hugeicons: 'PenIcon',
																																					phosphor: 'PencilIcon',
																																					remixicon: 'RiPencilLine'
																																				});

																																				$$renderer.push(`<!----> Canvas`);
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

												$$renderer.push(` `);

												if (Tooltip.Root) {
													$$renderer.push('<!--[-->');

													Tooltip.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	if (InputGroup.Button) {
																		$$renderer.push('<!--[-->');

																		InputGroup.Button($$renderer, $.spread_props([
																			{
																				variant: 'ghost',
																				size: 'icon-sm',
																				onclick: () => dictateEnabled = !dictateEnabled,
																				class: 'ml-auto rounded-4xl'
																			},
																			props,
																			{
																				children: ($$renderer) => {
																					IconPlaceholder($$renderer, {
																						lucide: 'AudioLinesIcon',
																						tabler: 'IconMicrophone',
																						hugeicons: 'AudioWave01Icon',
																						phosphor: 'MicrophoneIcon',
																						remixicon: 'RiMicLine'
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
																		$$renderer.push(`<!---->Dictate`);
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

												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, {
														size: 'icon-sm',
														variant: 'default',
														class: 'rounded-4xl',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'ArrowUpIcon',
																tabler: 'IconArrowUp',
																hugeicons: 'ArrowUp02Icon',
																phosphor: 'ArrowUpIcon',
																remixicon: 'RiArrowUpLine'
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