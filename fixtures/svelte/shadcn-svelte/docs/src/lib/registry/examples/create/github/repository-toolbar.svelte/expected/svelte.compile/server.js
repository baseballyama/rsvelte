import * as $ from 'svelte/internal/server';
import * as Command from "$lib/registry/ui/command/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Kbd } from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Repository_toolbar($$renderer) {
	let selectedBranch = "main";

	const branches = [
		"main",
		"develop",
		"feature/123",
		"feature/user-authentication",
		"feature/dashboard-redesign",
		"bugfix/login-error",
		"hotfix/security-patch",
		"release/v2.0.0",
		"feature/api-integration",
		"bugfix/memory-leak",
		"feature/dark-mode",
		"feature/responsive-design",
		"bugfix/typo-fix",
		"feature/search-functionality",
		"release/v1.9.0",
		"feature/notifications",
		"bugfix/cache-issue",
		"feature/payment-gateway",
		"hotfix/critical-bug",
		"feature/admin-panel",
		"bugfix/validation-error",
		"feature/analytics",
		"release/v2.1.0"
	];

	Example($$renderer, {
		title: 'Repository Toolbar',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-2">`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Input) {
							$$renderer.push('<!--[-->');
							InputGroup.Input($$renderer, { placeholder: 'Go to file' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								align: 'inline-start',
								children: ($$renderer) => {
									if (InputGroup.Button) {
										$$renderer.push('<!--[-->');

										InputGroup.Button($$renderer, {
											variant: 'ghost',
											size: 'icon-xs',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'SearchIcon',
													tabler: 'IconSearch',
													hugeicons: 'SearchIcon',
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
									Kbd($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->t`);
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

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Add File `);

											IconPlaceholder($$renderer, {
												lucide: 'ChevronDownIcon',
												tabler: 'IconChevronDown',
												hugeicons: 'ArrowDown01Icon',
												phosphor: 'CaretDownIcon',
												remixicon: 'RiArrowDownSLine',
												'data-icon': 'inline-end'
											});

											$$renderer.push(`<!---->`);
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
												IconPlaceholder($$renderer, {
													lucide: 'PlusIcon',
													tabler: 'IconPlus',
													hugeicons: 'PlusSignIcon',
													phosphor: 'PlusIcon',
													remixicon: 'RiAddLine'
												});

												$$renderer.push(`<!----> Create new file`);
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
													lucide: 'UploadIcon',
													hugeicons: 'Upload01Icon',
													tabler: 'IconUpload',
													phosphor: 'UploadIcon',
													remixicon: 'RiUploadLine'
												});

												$$renderer.push(`<!----> Upload files`);
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

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');

							Tooltip.Root($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											{
												function child($$renderer, { props: triggerProps }) {
													Button($$renderer, $.spread_props([
														{ variant: 'outline', size: 'icon' },
														triggerProps,
														{
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CloudCogIcon',
																	hugeicons: 'AiCloud01Icon',
																	tabler: 'IconCloudCog',
																	phosphor: 'CloudArrowUpIcon',
																	remixicon: 'RiCloudLine'
																});
															},
															$$slots: { default: true }
														}
													]));
												}

												if (Popover.Trigger) {
													$$renderer.push('<!--[-->');
													Popover.Trigger($$renderer, $.spread_props([props, { child, $$slots: { child: true } }]));
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
												$$renderer.push(`<!---->New Agent Task`);
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

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-80',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'new-agent-task',
														children: ($$renderer) => {
															$$renderer.push(`<!---->New Agent Task`);
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
																InputGroup.Textarea($$renderer, { placeholder: 'Describe your task in natural language.' });
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
																		if (Popover.Root) {
																			$$renderer.push('<!--[-->');

																			Popover.Root($$renderer, {
																				children: ($$renderer) => {
																					if (Tooltip.Root) {
																						$$renderer.push('<!--[-->');

																						Tooltip.Root($$renderer, {
																							children: ($$renderer) => {
																								{
																									function child($$renderer, { props }) {
																										{
																											function child($$renderer, { props: triggerProps }) {
																												if (InputGroup.Button) {
																													$$renderer.push('<!--[-->');

																													InputGroup.Button($$renderer, $.spread_props([
																														{ variant: 'outline', size: 'icon-sm' },
																														triggerProps,
																														{
																															children: ($$renderer) => {
																																IconPlaceholder($$renderer, {
																																	lucide: 'GitBranchIcon',
																																	hugeicons: 'GitBranchIcon',
																																	tabler: 'IconGitBranch',
																																	phosphor: 'GitBranchIcon',
																																	remixicon: 'RiGitBranchLine'
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
																												Tooltip.Trigger($$renderer, $.spread_props([props, { child, $$slots: { child: true } }]));
																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
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

																								if (Tooltip.Content) {
																									$$renderer.push('<!--[-->');

																									Tooltip.Content($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Select a branch`);
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

																					if (Popover.Content) {
																						$$renderer.push('<!--[-->');

																						Popover.Content($$renderer, {
																							side: 'bottom',
																							align: 'start',
																							class: 'p-1',
																							children: ($$renderer) => {
																								if (Field.Field) {
																									$$renderer.push('<!--[-->');

																									Field.Field($$renderer, {
																										children: ($$renderer) => {
																											if (Field.Label) {
																												$$renderer.push('<!--[-->');

																												Field.Label($$renderer, {
																													for: 'select-branch',
																													class: 'sr-only',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Select a Branch`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (Command.Root) {
																												$$renderer.push('<!--[-->');

																												Command.Root($$renderer, {
																													children: ($$renderer) => {
																														if (Command.Input) {
																															$$renderer.push('<!--[-->');
																															Command.Input($$renderer, { id: 'select-branch', placeholder: 'Find a branch' });
																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (Command.Empty) {
																															$$renderer.push('<!--[-->');

																															Command.Empty($$renderer, {
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->No branches found`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (Command.List) {
																															$$renderer.push('<!--[-->');

																															Command.List($$renderer, {
																																children: ($$renderer) => {
																																	if (Command.Group) {
																																		$$renderer.push('<!--[-->');

																																		Command.Group($$renderer, {
																																			children: ($$renderer) => {
																																				$$renderer.push(`<!--[-->`);

																																				const each_array = $.ensure_array_like(branches);

																																				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																																					let branch = each_array[$$index];

																																					if (Command.Item) {
																																						$$renderer.push('<!--[-->');

																																						Command.Item($$renderer, {
																																							value: branch,
																																							onSelect: () => selectedBranch = branch,
																																							'data-checked': selectedBranch === branch,
																																							children: ($$renderer) => {
																																								$$renderer.push(`<!---->${$.escape(branch)}`);
																																							},
																																							$$slots: { default: true }
																																						});

																																						$$renderer.push('<!--]-->');
																																					} else {
																																						$$renderer.push('<!--[!-->');
																																						$$renderer.push('<!--]-->');
																																					}
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

																		if (Popover.Root) {
																			$$renderer.push('<!--[-->');

																			Popover.Root($$renderer, {
																				children: ($$renderer) => {
																					if (Tooltip.Root) {
																						$$renderer.push('<!--[-->');

																						Tooltip.Root($$renderer, {
																							children: ($$renderer) => {
																								{
																									function child($$renderer, { props }) {
																										{
																											function child($$renderer, { props: triggerProps }) {
																												if (InputGroup.Button) {
																													$$renderer.push('<!--[-->');

																													InputGroup.Button($$renderer, $.spread_props([
																														{ variant: 'outline', size: 'icon-sm' },
																														triggerProps,
																														{
																															children: ($$renderer) => {
																																IconPlaceholder($$renderer, {
																																	lucide: 'BotIcon',
																																	hugeicons: 'RoboticIcon',
																																	tabler: 'IconRobot',
																																	phosphor: 'RobotIcon',
																																	remixicon: 'RiRobotLine'
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
																												Tooltip.Trigger($$renderer, $.spread_props([props, { child, $$slots: { child: true } }]));
																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
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

																								if (Tooltip.Content) {
																									$$renderer.push('<!--[-->');

																									Tooltip.Content($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Select Agent`);
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

																					if (Popover.Content) {
																						$$renderer.push('<!--[-->');

																						Popover.Content($$renderer, {
																							side: 'top',
																							align: 'start',
																							children: ($$renderer) => {
																								if (Empty.Root) {
																									$$renderer.push('<!--[-->');

																									Empty.Root($$renderer, {
																										class: 'gap-4 p-0',
																										children: ($$renderer) => {
																											if (Empty.Header) {
																												$$renderer.push('<!--[-->');

																												Empty.Header($$renderer, {
																													children: ($$renderer) => {
																														if (Empty.Title) {
																															$$renderer.push('<!--[-->');

																															Empty.Title($$renderer, {
																																class: 'text-sm',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->This repository has no custom agents`);
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
																																class: 'text-xs',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->Custom agents are reusable instructions and tools in your repository.`);
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
																															variant: 'outline',
																															size: 'sm',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Create Custom Agent`);
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
																									{ variant: 'ghost', size: 'icon-sm', class: 'ml-auto' },
																									props,
																									{
																										children: ($$renderer) => {
																											IconPlaceholder($$renderer, {
																												lucide: 'SendIcon',
																												hugeicons: 'SentIcon',
																												tabler: 'IconSend',
																												phosphor: 'PaperPlaneTiltIcon',
																												remixicon: 'RiSendPlaneLine'
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
																							class: 'flex items-center gap-2 pr-2',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Start Task `);

																								Kbd($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->⏎`);
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

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}