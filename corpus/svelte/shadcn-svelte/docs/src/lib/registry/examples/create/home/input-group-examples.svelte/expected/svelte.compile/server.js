import * as $ from 'svelte/internal/server';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_group_examples($$renderer) {
	let isFavorite = false;
	let voiceEnabled = false;

	Example($$renderer, {
		title: 'Input Group',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-6">`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Input) {
							$$renderer.push('<!--[-->');
							InputGroup.Input($$renderer, { placeholder: 'Search...' });
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
									IconPlaceholder($$renderer, {
										lucide: 'SearchIcon',
										tabler: 'IconSearch',
										hugeicons: 'Search01Icon',
										phosphor: 'MagnifyingGlassIcon',
										remixicon: 'RiSearchLine'
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

						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								align: 'inline-end',
								children: ($$renderer) => {
									$$renderer.push(`<!---->12 results`);
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

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Input) {
							$$renderer.push('<!--[-->');
							InputGroup.Input($$renderer, { placeholder: 'example.com', class: 'pl-1!' });
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
									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
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
																{ class: 'rounded-full', size: 'icon-xs', 'aria-label': 'Info' },
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

			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							for: 'input-secure-19',
							class: 'sr-only',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Input Secure`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (InputGroup.Root) {
							$$renderer.push('<!--[-->');

							InputGroup.Root($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Input) {
										$$renderer.push('<!--[-->');
										InputGroup.Input($$renderer, { id: 'input-secure-19', class: 'pl-0.5!' });
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
												if (Popover.Root) {
													$$renderer.push('<!--[-->');

													Popover.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	if (InputGroup.Button) {
																		$$renderer.push('<!--[-->');

																		InputGroup.Button($$renderer, $.spread_props([
																			{ variant: 'secondary', size: 'icon-xs', 'aria-label': 'Info' },
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
																	alignOffset: 10,
																	class: 'flex flex-col gap-1 rounded-xl text-sm',
																	children: ($$renderer) => {
																		$$renderer.push(`<p class="font-medium">Your connection is not secure.</p> <p>You should not enter any sensitive information on this site.</p>`);
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

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											class: 'pl-1! text-muted-foreground',
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

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											align: 'inline-end',
											children: ($$renderer) => {
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, {
														onclick: () => isFavorite = !isFavorite,
														size: 'icon-xs',
														'aria-label': 'Favorite',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'StarIcon',
																tabler: 'IconStar',
																hugeicons: 'StarIcon',
																phosphor: 'StarIcon',
																remixicon: 'RiStarLine',
																'data-favorite': isFavorite,
																class: 'data-[favorite=true]:fill-primary data-[favorite=true]:stroke-primary'
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

			$$renderer.push(` `);

			if (ButtonGroup.Root) {
				$$renderer.push('<!--[-->');

				ButtonGroup.Root($$renderer, {
					class: 'w-full',
					children: ($$renderer) => {
						if (ButtonGroup.Root) {
							$$renderer.push('<!--[-->');

							ButtonGroup.Root($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										variant: 'outline',
										size: 'icon',
										'aria-label': 'Add',
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
								class: 'flex-1',
								children: ($$renderer) => {
									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');

													InputGroup.Input($$renderer, {
														placeholder: voiceEnabled ? "Record and send audio..." : "Send a message...",
														disabled: voiceEnabled
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
																						{
																							onclick: () => voiceEnabled = !voiceEnabled,
																							'data-active': voiceEnabled,
																							class: 'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
																							'aria-pressed': voiceEnabled,
																							size: 'icon-xs',
																							'aria-label': 'Voice Mode'
																						},
																						props,
																						{
																							children: ($$renderer) => {
																								IconPlaceholder($$renderer, {
																									lucide: 'AudioLinesIcon',
																									tabler: 'IconWaveSine',
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
																					$$renderer.push(`<!---->Voice Mode`);
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

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Textarea) {
							$$renderer.push('<!--[-->');
							InputGroup.Textarea($$renderer, { placeholder: 'Ask, Search or Chat...' });
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
									if (InputGroup.Button) {
										$$renderer.push('<!--[-->');

										InputGroup.Button($$renderer, {
											variant: 'outline',
											class: 'rounded-full style-lyra:rounded-none',
											size: 'icon-xs',
											'aria-label': 'Add',
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
														if (InputGroup.Button) {
															$$renderer.push('<!--[-->');

															InputGroup.Button($$renderer, $.spread_props([
																{ variant: 'ghost' },
																props,
																{
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Auto`);
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
														side: 'top',
														align: 'start',
														class: '[--radius:0.95rem]',
														children: ($$renderer) => {
															if (DropdownMenu.Group) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Group($$renderer, {
																	children: ($$renderer) => {
																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Auto`);
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
																					$$renderer.push(`<!---->Agent`);
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
																					$$renderer.push(`<!---->Manual`);
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

									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
											class: 'ml-auto',
											children: ($$renderer) => {
												$$renderer.push(`<!---->52% used`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Separator($$renderer, { orientation: 'vertical', class: 'h-4!' });
									$$renderer.push(`<!----> `);

									if (InputGroup.Button) {
										$$renderer.push('<!--[-->');

										InputGroup.Button($$renderer, {
											variant: 'default',
											class: 'rounded-full style-lyra:rounded-none',
											size: 'icon-xs',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'ArrowUpIcon',
													tabler: 'IconArrowUp',
													hugeicons: 'ArrowUp01Icon',
													phosphor: 'ArrowUpIcon',
													remixicon: 'RiArrowUpLine'
												});

												$$renderer.push(`<!----> <span class="sr-only">Send</span>`);
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
}